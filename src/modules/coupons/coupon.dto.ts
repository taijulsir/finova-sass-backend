import { z } from 'zod';

export const createCouponDto = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be less than 20 characters')
    .trim()
    .toUpperCase(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0, 'Value must be positive'),
  maxUsage: z.number().min(0).default(0),
  appliesToPlans: z.array(z.string()).default([]),
  minPurchaseAmount: z.number().min(0).default(0),
  startsAt: z.string().transform((val) => new Date(val)).optional(),
  expiresAt: z.string().transform((val) => new Date(val)),
  isActive: z.boolean().optional().default(true),
});

export type CreateCouponDto = z.infer<typeof createCouponDto>;

export const updateCouponDto = z.object({
  code: z.string().min(3).max(20).trim().toUpperCase().optional(),
  type: z.enum(['percentage', 'fixed']).optional(),
  value: z.number().min(0).optional(),
  maxUsage: z.number().min(0).optional(),
  appliesToPlans: z.array(z.string()).optional(),
  minPurchaseAmount: z.number().min(0).optional(),
  startsAt: z.string().transform((val) => new Date(val)).optional(),
  expiresAt: z.string().transform((val) => new Date(val)).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCouponDto = z.infer<typeof updateCouponDto>;

export const validateCouponDto = z.object({
  code: z.string().trim().toUpperCase(),
  planId: z.string(),
  amount: z.number().min(0),
});

export type ValidateCouponDto = z.infer<typeof validateCouponDto>;
