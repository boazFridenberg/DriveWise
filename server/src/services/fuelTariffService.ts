import type { IFuelTariff } from '../../../types.js';
import { ISRAELI_DEFAULTS } from '../../../types.js';

/**
 * שכבת אינטגרציה ל-Israeli Fuel Tariff API (מדומה).
 * במערכת ייצור: ממשק מול משרד האנרגיה / ספקי דלק מורשים.
 */

let cachedTariff: IFuelTariff = {
  pricePerLiter: ISRAELI_DEFAULTS.fuelPricePerLiter,
  currency: 'ILS',
  source: 'משרד האנרגיה — תעריף מוסדר',
  lastUpdated: new Date().toISOString(),
};

const TARIFF_HISTORY = [7.38, 7.42, 7.45, 7.39, 7.42];

export async function fetchIsraeliFuelTariff(): Promise<IFuelTariff> {
  await simulateLatency(120, 350);

  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % TARIFF_HISTORY.length;
  const officialPrice = TARIFF_HISTORY[dayIndex];

  if (officialPrice !== cachedTariff.pricePerLiter) {
    cachedTariff = {
      pricePerLiter: officialPrice,
      currency: 'ILS',
      source: 'משרד האנרגיה — תעריף מוסדר',
      lastUpdated: new Date().toISOString(),
    };
  }

  return { ...cachedTariff };
}

export function getCurrentFuelPrice(): number {
  return cachedTariff.pricePerLiter;
}

export function startFuelTariffScheduler(intervalMs = 30 * 60 * 1000): NodeJS.Timeout {
  return setInterval(() => {
    void fetchIsraeliFuelTariff().then((tariff) => {
      console.log(`⛽ תעריף דלק עודכן: ₪${tariff.pricePerLiter}/ל' (${tariff.lastUpdated})`);
    });
  }, intervalMs);
}

function simulateLatency(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((r) => setTimeout(r, ms));
}
