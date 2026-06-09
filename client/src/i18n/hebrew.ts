import type { FuelType, UserRole } from '../../../types';

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

export const ISRAELI_DEFAULTS = {
  fuelPricePerLiter: 7.42,
  electricityRatePerKwh: 0.6,
  compulsoryInsuranceAnnual: 2800,
  comprehensiveInsuranceRate: 0.03,
  depreciationRate: 0.12,
  maintenanceRateOfVehicleValue: 0.02,
} as const;

export const FUEL_FILTER_LABELS: Record<FuelType | 'All', string> = {
  All: 'הכל',
  ...FUEL_TYPE_LABELS_HE,
};
