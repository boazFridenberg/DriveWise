import express, { type Request, type Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TcoCalculationRequest,
  TcoCalculationResponse,
  ITcoCalculation,
  CreateUserRequest,
  UpdateUserRequest,
  IVehicle,
  ICostLine,
  ITcoCostBreakdown,
} from '../../types.js';
import { ISRAELI_DEFAULTS, formatAddress } from '../../types.js';
import {
  authenticateToken,
  requireRole,
  optionalAuth,
  JWT_SECRET,
  type AuthenticatedRequest,
} from './middleware.js';
import { fetchCarData, fetchVehicleById } from './services/carDataService.js';
import { calculateRouteDistance } from './services/distanceService.js';
import { searchAddresses } from './services/addressService.js';
import {
  fetchIsraeliFuelTariff,
  getCurrentFuelPrice,
  startFuelTariffScheduler,
} from './services/fuelTariffService.js';
import {
  authenticateIdentifier,
  registerUser,
  listUsers,
  createUserByAdmin,
  updateUser,
  findUserById,
} from './data/userStore.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: /^http:\/\/localhost:517\d$/, credentials: true }));
app.use(express.json());

const calculations: ITcoCalculation[] = [];

void fetchIsraeliFuelTariff();
startFuelTariffScheduler();

// ─── Auth ───────────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req: Request, res: Response): void => {
  const { identifier, password } = req.body as LoginRequest;
  if (!identifier || !password) {
    res.status(400).json({ error: 'נדרשים אימייל/טלפון וסיסמה', code: 400 });
    return;
  }

  const user = authenticateIdentifier(identifier, password);
  if (!user) {
    res.status(401).json({ error: 'פרטי התחברות שגויים', code: 401 });
    return;
  }
  if (user.isBanned) {
    res.status(403).json({ error: 'החשבון חסום. פנו לתמיכה.', code: 403 });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' },
  );
  res.json({ token, user } satisfies LoginResponse);
});

app.post('/api/auth/register', (req: Request, res: Response): void => {
  const body = req.body as RegisterRequest;
  const { firstName, lastName, email, phone, password } = body;

  if (!firstName || !lastName || !email || !phone || !password) {
    res.status(400).json({ error: 'יש למלא את כל שדות החובה', code: 400 });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'הסיסמה חייבת להכיל לפחות 6 תווים', code: 400 });
    return;
  }

  try {
    const user = registerUser({ firstName, lastName, email, phone, password, role: 'USER' });
    const token = jwt.sign(
      { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' },
    );
    res.status(201).json({ token, user } satisfies LoginResponse);
  } catch (err) {
    res.status(409).json({ error: err instanceof Error ? err.message : 'שגיאת הרשמה', code: 409 });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'המשתמש לא נמצא', code: 404 });
    return;
  }
  res.json(user);
});

// ─── Fuel Tariff (Public) ───────────────────────────────────────────────────

app.get('/api/fuel-tariff', async (_req: Request, res: Response): Promise<void> => {
  try {
    const tariff = await fetchIsraeliFuelTariff();
    res.json(tariff);
  } catch {
    res.status(502).json({ error: 'שירות תעריף הדלק אינו זמין', code: 502 });
  }
});

// ─── Address Autocomplete ───────────────────────────────────────────────────

app.get('/api/addresses/search', async (req: Request, res: Response): Promise<void> => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const city = typeof req.query.city === 'string' ? req.query.city : undefined;
  const results = await searchAddresses(q, city);
  res.json(results);
});

// ─── Vehicles ───────────────────────────────────────────────────────────────

app.get('/api/vehicles', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const make = typeof req.query.make === 'string' ? req.query.make : undefined;
    const model = typeof req.query.model === 'string' ? req.query.model : undefined;
    res.json(await fetchCarData(make, model));
  } catch {
    res.status(502).json({ error: 'שירות נתוני הרכב אינו זמין', code: 502 });
  }
});

app.get('/api/vehicles/:id', async (req: Request, res: Response): Promise<void> => {
  const vehicle = await fetchVehicleById(String(req.params.id));
  if (!vehicle) {
    res.status(404).json({ error: 'הרכב לא נמצא', code: 404 });
    return;
  }
  res.json(vehicle);
});

// ─── TCO ────────────────────────────────────────────────────────────────────

app.post(
  '/api/calculations/tco',
  authenticateToken,
  requireRole(['USER', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const body = req.body as TcoCalculationRequest;
    const { vehicleId, home, work, workDaysPerWeek, weeksPerYear } = body;

    if (!vehicleId || !home?.street || !home?.city || !work?.street || !work?.city) {
      res.status(400).json({ error: 'יש למלא את כל שדות הכתובת והרכב', code: 400 });
      return;
    }

    const vehicle = await fetchVehicleById(vehicleId);
    if (!vehicle) {
      res.status(404).json({ error: 'הרכב לא נמצא', code: 404 });
      return;
    }

    try {
      const fuelTariff = await fetchIsraeliFuelTariff();
      const homeStr = formatAddress(home);
      const workStr = formatAddress(work);
      const distance = await calculateRouteDistance(homeStr, workStr);

      const annualMileage = Math.round(distance.distanceKm * 2 * workDaysPerWeek * weeksPerYear);
      const breakdown = buildTcoBreakdown(vehicle, annualMileage, fuelTariff.pricePerLiter);

      const calculation: ITcoCalculation = {
        id: `tco-${Date.now()}`,
        userId: req.user!.id,
        vehicleId: vehicle.id,
        annualMileage,
        fuelPricePerLiter: fuelTariff.pricePerLiter,
        breakdown,
        currency: 'ILS',
      };

      calculations.push(calculation);

      res.status(201).json({
        ...calculation,
        vehicle,
        distance,
        fuelTariff,
      } satisfies TcoCalculationResponse);
    } catch {
      res.status(502).json({ error: 'שגיאה בחישוב עלות הבעלות', code: 502 });
    }
  },
);

function toCostLine(annual: number): ICostLine {
  return { annual, monthly: Math.round((annual / 12) * 100) / 100 };
}

function buildTcoBreakdown(
  vehicle: IVehicle,
  annualKm: number,
  fuelPrice: number,
): ITcoCostBreakdown {
  const fuelAnnual = computeFuelAnnual(vehicle, annualKm, fuelPrice);
  const compulsory = ISRAELI_DEFAULTS.compulsoryInsuranceAnnual;
  const comprehensive = Math.round(vehicle.basePrice * ISRAELI_DEFAULTS.comprehensiveInsuranceRate);
  const insuranceTotal = compulsory + comprehensive;
  const depreciation = Math.round(vehicle.basePrice * ISRAELI_DEFAULTS.depreciationRate);
  const maintenance = Math.round(vehicle.basePrice * ISRAELI_DEFAULTS.maintenanceRateOfVehicleValue);

  const totalAnnual = fuelAnnual + insuranceTotal + depreciation + maintenance;

  return {
    fuel: toCostLine(fuelAnnual),
    insuranceCompulsory: toCostLine(compulsory),
    insuranceComprehensive: toCostLine(comprehensive),
    insuranceTotal: toCostLine(insuranceTotal),
    depreciation: toCostLine(depreciation),
    maintenance: toCostLine(maintenance),
    total: toCostLine(totalAnnual),
  };
}

function computeFuelAnnual(
  vehicle: Pick<IVehicle, 'fuelType' | 'averageFuelConsumption'>,
  annualKm: number,
  fuelPricePerLiter: number,
): number {
  if (vehicle.fuelType === 'Electric') {
    return Math.round((annualKm / 100) * 16 * ISRAELI_DEFAULTS.electricityRatePerKwh);
  }
  return Math.round((annualKm / 100) * vehicle.averageFuelConsumption * fuelPricePerLiter);
}

// ─── Admin ──────────────────────────────────────────────────────────────────

app.get('/api/admin/users', authenticateToken, requireRole(['ADMIN']), (_req, res) => {
  res.json(listUsers());
});

app.post('/api/admin/users', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  const body = req.body as CreateUserRequest;
  try {
    const user = createUserByAdmin(body);
    res.status(201).json(user);
  } catch (err) {
    res.status(409).json({ error: err instanceof Error ? err.message : 'שגיאה', code: 409 });
  }
});

app.put('/api/admin/users/:userId', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  try {
    const user = updateUser(String(req.params.userId), req.body as UpdateUserRequest);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'שגיאה', code: 404 });
  }
});

app.patch('/api/admin/users/:userId/ban', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  try {
    const user = updateUser(String(req.params.userId), { isBanned: true });
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'שגיאה', code: 404 });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', fuelPrice: getCurrentFuelPrice() });
});

app.listen(PORT, () => {
  console.log(`DriveWise API — http://localhost:${PORT}`);
});
