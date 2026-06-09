import type { IAddressSuggestion } from '../../../types.js';

/**
 * שכבת אינטגרציה ל-Google Places / Israel Post Address API (מדומה).
 */

const ISRAELI_ADDRESSES: IAddressSuggestion[] = [
  { id: 'addr-001', label: 'הרצל 45, תל אביב', street: 'הרצל', houseNumber: '45', city: 'תל אביב' },
  { id: 'addr-002', label: 'הרצל 12 דירה 3, תל אביב', street: 'הרצל', houseNumber: '12', apartment: '3', city: 'תל אביב' },
  { id: 'addr-003', label: 'דיזנגוף 100, תל אביב', street: 'דיזנגוף', houseNumber: '100', city: 'תל אביב' },
  { id: 'addr-004', label: 'רוטשילד 22, תל אביב', street: 'רוטשילד', houseNumber: '22', city: 'תל אביב' },
  { id: 'addr-005', label: 'הנביאים 8, חיפה', street: 'הנביאים', houseNumber: '8', city: 'חיפה' },
  { id: 'addr-006', label: 'מוריה 120, חיפה', street: 'מוריה', houseNumber: '120', city: 'חיפה' },
  { id: 'addr-007', label: 'יפו 30, ירושלים', street: 'יפו', houseNumber: '30', city: 'ירושלים' },
  { id: 'addr-008', label: 'בן יהודה 55, ירושלים', street: 'בן יהודה', houseNumber: '55', city: 'ירושלים' },
  { id: 'addr-009', label: 'הרצל 5, רמת גן', street: 'הרצל', houseNumber: '5', city: 'רמת גן' },
  { id: 'addr-010', label: 'ביאליק 18, רמת גן', street: 'ביאליק', houseNumber: '18', city: 'רמת גן' },
  { id: 'addr-011', label: 'ויצמן 90, נתניה', street: 'ויצמן', houseNumber: '90', city: 'נתניה' },
  { id: 'addr-012', label: 'רגר 40, באר שבע', street: 'רגר', houseNumber: '40', city: 'באר שבע' },
  { id: 'addr-013', label: 'העצמאות 15, אשדוד', street: 'העצמאות', houseNumber: '15', city: 'אשדוד' },
  { id: 'addr-014', label: 'סוקולוב 33, הרצליה', street: 'סוקולוב', houseNumber: '33', city: 'הרצליה' },
  { id: 'addr-015', label: 'ויצמן 12 דירה 7, פתח תקווה', street: 'ויצמן', houseNumber: '12', apartment: '7', city: 'פתח תקווה' },
];

export async function searchAddresses(query: string, city?: string): Promise<IAddressSuggestion[]> {
  await simulateLatency(80, 200);

  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  return ISRAELI_ADDRESSES.filter((addr) => {
    const matchQuery =
      addr.label.toLowerCase().includes(q) ||
      addr.street.toLowerCase().includes(q) ||
      addr.city.toLowerCase().includes(q);
    const matchCity = !city || addr.city === city;
    return matchQuery && matchCity;
  }).slice(0, 8);
}

function simulateLatency(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((r) => setTimeout(r, ms));
}
