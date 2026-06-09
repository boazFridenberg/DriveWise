/**
 * שכבת אינטגרציה ל-Pexels / Unsplash Car Image API (מדומה).
 * שולפת תמונות לפי יצרן ודגם בזמן אמת.
 */

const VERIFIED_IMAGES: Record<string, string> = {
  'tesla|model 3': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=85',
  'byd|atto 3': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=85',
  'hyundai|tucson': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=85',
  'toyota|corolla hybrid': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=85',
  'kia|sportage': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=85',
  'mazda|cx-5': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=85',
};

const FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=85',
];

export async function fetchCarImage(make: string, model: string): Promise<string> {
  await simulateLatency(100, 280);

  const key = `${make.toLowerCase()}|${model.toLowerCase()}`;
  if (VERIFIED_IMAGES[key]) return VERIFIED_IMAGES[key];

  const partial = Object.entries(VERIFIED_IMAGES).find(
    ([k]) => k.startsWith(make.toLowerCase()) || k.includes(model.toLowerCase()),
  );
  if (partial) return partial[1];

  const hash = hashString(`${make}${model}`);
  return FALLBACK_POOL[hash % FALLBACK_POOL.length];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function simulateLatency(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((r) => setTimeout(r, ms));
}
