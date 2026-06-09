// DriveWise — Shared TypeScript contracts (strict, no `any`)

export type UserRole = 'GUEST' | 'USER' | 'ADMIN';
export type AssignableRole = 'USER' | 'ADMIN';
export type FuelType = 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
export type CurrencyCode = 'ILS';

export interface IUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  isBanned?: boolean;
}

export interface IVehicleSpecs {
  engineLayout: string;
  batteryCapacityKwh?: number;
  safetyRating: number;
  transmission: string;
  driveType: string;
  warrantyYears: number;
}

export interface IVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  horsepower: number;
  averageFuelConsumption: number;
  basePrice: number;
  imageUrl: string;
  currency: CurrencyCode;
  specs: IVehicleSpecs;
}

export interface IStructuredAddress {
  street: string;
  houseNumber: string;
  apartment?: string;
  city: string;
}

export interface IAddressSuggestion {
  id: string;
  label: string;
  street: string;
  houseNumber: string;
  apartment?: string;
  city: string;
}

export interface IDistanceResponse {
  origin: string;
  destination: string;
  distanceKm: number;
  durationMinutes: number;
}

export interface ICostLine {
  annual: number;
  monthly: number;
}

export interface ITcoCostBreakdown {
  fuel: ICostLine;
  insuranceCompulsory: ICostLine;
  insuranceComprehensive: ICostLine;
  insuranceTotal: ICostLine;
  depreciation: ICostLine;
  maintenance: ICostLine;
  total: ICostLine;
}

export interface ITcoCalculation {
  id: string;
  userId: string;
  vehicleId: string;
  annualMileage: number;
  fuelPricePerLiter: number;
  breakdown: ITcoCostBreakdown;
  currency: CurrencyCode;
}

export interface IFuelTariff {
  pricePerLiter: number;
  currency: CurrencyCode;
  source: string;
  lastUpdated: string;
}

export const ISRAELI_DEFAULTS = {
  fuelPricePerLiter: 7.42,
  electricityRatePerKwh: 0.6,
  compulsoryInsuranceAnnual: 2800,
  comprehensiveInsuranceRate: 0.03,
  depreciationRate: 0.12,
  maintenanceRateOfVehicleValue: 0.02,
} as const;

export const FUEL_TYPE_LABELS_HE: Record<FuelType, string> = {
  Gasoline: 'בנזין',
  Diesel: 'דיזל',
  Electric: 'חשמלי',
  Hybrid: 'היברידי',
};

export const ROLE_LABELS_HE: Record<UserRole, string> = {
  GUEST: 'אורח',
  USER: 'משתמש',
  ADMIN: 'מנהל',
};

export const CURRENCY_SYMBOL = '₪';
export const LOCALE = 'he-IL';

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: IUser;
}

// ─── TCO ────────────────────────────────────────────────────────────────────

export interface TcoCalculationRequest {
  vehicleId: string;
  home: IStructuredAddress;
  work: IStructuredAddress;
  workDaysPerWeek: number;
  weeksPerYear: number;
}

export interface TcoCalculationResponse extends ITcoCalculation {
  vehicle: IVehicle;
  distance: IDistanceResponse;
  fuelTariff: IFuelTariff;
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: AssignableRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: AssignableRole;
  isBanned?: boolean;
}

export interface ApiError {
  error: string;
  code: number;
}

export interface JwtPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export function formatAddress(addr: IStructuredAddress): string {
  const apt = addr.apartment ? ` דירה ${addr.apartment}` : '';
  return `${addr.street} ${addr.houseNumber}${apt}, ${addr.city}`;
}
