import type { IVehicle, IVehicleSpecs, FuelType } from '../../../types.js';
import { fetchCarImage } from './imageProviderService.js';

interface VehicleSeed {
  id: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  horsepower: number;
  averageFuelConsumption: number;
  basePrice: number;
  specs: IVehicleSpecs;
}

const CATALOG_SEED: VehicleSeed[] = [
  {
    id: 'veh-001', make: 'Tesla', model: 'Model 3', year: 2026,
    fuelType: 'Electric', horsepower: 283, averageFuelConsumption: 0, basePrice: 240000,
    specs: { engineLayout: 'חשמלי קדמי', batteryCapacityKwh: 60, safetyRating: 5, transmission: 'חד-מהירות', driveType: '4X2', warrantyYears: 4 },
  },
  {
    id: 'veh-002', make: 'BYD', model: 'Atto 3', year: 2026,
    fuelType: 'Electric', horsepower: 204, averageFuelConsumption: 0, basePrice: 175000,
    specs: { engineLayout: 'חשמלי קדמי', batteryCapacityKwh: 60.5, safetyRating: 5, transmission: 'חד-מהירות', driveType: '4X2', warrantyYears: 6 },
  },
  {
    id: 'veh-003', make: 'Hyundai', model: 'Tucson', year: 2026,
    fuelType: 'Gasoline', horsepower: 180, averageFuelConsumption: 8.2, basePrice: 185000,
    specs: { engineLayout: '4 צילינדר בשורה', safetyRating: 5, transmission: 'אוטומטית 8 הילוכים', driveType: '4X2', warrantyYears: 5 },
  },
  {
    id: 'veh-004', make: 'Toyota', model: 'Corolla Hybrid', year: 2026,
    fuelType: 'Hybrid', horsepower: 140, averageFuelConsumption: 4.5, basePrice: 165000,
    specs: { engineLayout: 'היברידי 1.8L', safetyRating: 5, transmission: 'CVT', driveType: '4X2', warrantyYears: 3 },
  },
  {
    id: 'veh-005', make: 'Kia', model: 'Sportage', year: 2026,
    fuelType: 'Gasoline', horsepower: 190, averageFuelConsumption: 7.9, basePrice: 195000,
    specs: { engineLayout: '4 צילינדר בשורה', safetyRating: 5, transmission: 'אוטומטית 8 הילוכים', driveType: '4X4', warrantyYears: 7 },
  },
  {
    id: 'veh-006', make: 'Mazda', model: 'CX-5', year: 2026,
    fuelType: 'Diesel', horsepower: 194, averageFuelConsumption: 5.8, basePrice: 210000,
    specs: { engineLayout: '4 צילינדר דיזל', safetyRating: 5, transmission: 'אוטומטית 6 הילוכים', driveType: '4X4', warrantyYears: 3 },
  },
];

async function enrichVehicle(seed: VehicleSeed): Promise<IVehicle> {
  const imageUrl = await fetchCarImage(seed.make, seed.model);
  return { ...seed, imageUrl, currency: 'ILS' };
}

export async function fetchCarData(make?: string, model?: string): Promise<IVehicle[]> {
  await simulateNetworkLatency(180, 420);

  let seeds = [...CATALOG_SEED];
  if (make) seeds = seeds.filter((v) => v.make.toLowerCase().includes(make.toLowerCase()));
  if (model) seeds = seeds.filter((v) => v.model.toLowerCase().includes(model.toLowerCase()));

  return Promise.all(seeds.map(enrichVehicle));
}

export async function fetchVehicleById(id: string): Promise<IVehicle | undefined> {
  await simulateNetworkLatency(80, 200);
  const seed = CATALOG_SEED.find((v) => v.id === id);
  return seed ? enrichVehicle(seed) : undefined;
}

function simulateNetworkLatency(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
