export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageCount: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  active: boolean;
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'c_1',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    usageCount: 42,
    maxUses: 100,
    expiresAt: null,
    active: true,
  },
  {
    id: 'c_2',
    code: 'SUMMER50',
    type: 'fixed',
    value: 50,
    usageCount: 3,
    maxUses: 10,
    expiresAt: '2026-09-01T00:00:00.000Z',
    active: false,
  },
];

export const CouponsService = {
  async list() {
    // In future, wire to DB. For now return mock data.
    return MOCK_COUPONS;
  },
  async get(id: string) {
    return MOCK_COUPONS.find((c) => c.id === id) ?? null;
  },
};
