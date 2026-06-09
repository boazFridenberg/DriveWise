import type { IDistanceResponse } from '../../../types.js';

/**
 * שכבת אינטגרציה מדומה ל-Maps / Distance API.
 * מסלולי נסיעה בין ערים מרכזיות בישראל.
 */

const KNOWN_ROUTES: Record<string, number> = {
  'חיפה|תל אביב': 95,
  'תל אביב|חיפה': 95,
  'תל אביב|רמת גן': 8.2,
  'רמת גן|תל אביב': 8.2,
  'ירושלים|תל אביב': 65,
  'תל אביב|ירושלים': 65,
  'באר שבע|תל אביב': 115,
  'תל אביב|באר שבע': 115,
  'נתניה|חיפה': 45,
  'חיפה|נתניה': 45,
  'אשדוד|תל אביב': 42,
  'תל אביב|אשדוד': 42,
  'פתח תקווה|תל אביב': 18,
  'תל אביב|פתח תקווה': 18,
  'חולון|תל אביב': 12,
  'תל אביב|חולון': 12,
};

export async function calculateRouteDistance(
  home: string,
  work: string,
): Promise<IDistanceResponse> {
  await simulateNetworkLatency(250, 600);

  const origin = home.trim();
  const destination = work.trim();
  const normalizedKey = `${origin}|${destination}`;
  const reverseKey = `${destination}|${origin}`;

  const distanceKm =
    KNOWN_ROUTES[normalizedKey] ??
    KNOWN_ROUTES[reverseKey] ??
    estimateDistanceFromHash(origin, destination);

  const averageSpeedKmh = 55;
  const durationMinutes = Math.round((distanceKm / averageSpeedKmh) * 60);

  return {
    origin,
    destination,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMinutes,
  };
}

function estimateDistanceFromHash(origin: string, destination: string): number {
  const combined = `${origin}${destination}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return 8 + (Math.abs(hash) % 55);
}

function simulateNetworkLatency(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
