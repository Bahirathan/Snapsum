// Re-exports from src/config/pricing.config.ts (Single Source of Truth)
import { PRICING_CONFIG } from '../config/pricing.config';

export {
  PRICING_CONFIG,
  FREE_PLAN_PRICE,
  PRO_PLAN_MONTHLY_PRICE,
  PRO_PLAN_ANNUAL_MONTHLY_PRICE,
  ENTERPRISE_PLAN_MONTHLY_PRICE,
} from '../config/pricing.config';

export const PRICING_SUMMARY = {
  free: {
    price: PRICING_CONFIG.free.price.toFixed(2),
    displayPrice: PRICING_CONFIG.free.displayPrice,
    period: PRICING_CONFIG.free.period,
    description: PRICING_CONFIG.free.description,
  },
  pro: {
    monthlyPrice: PRICING_CONFIG.pro.price.toFixed(2),
    annualMonthlyPrice: "6.99",
    displayPriceMonthly: PRICING_CONFIG.pro.displayPrice,
    displayPriceAnnual: "$6.99",
    description: PRICING_CONFIG.pro.description,
  },
  enterprise: {
    price: PRICING_CONFIG.enterprise.price.toFixed(2),
    displayPrice: PRICING_CONFIG.enterprise.displayPrice,
    period: "month",
    description: PRICING_CONFIG.enterprise.description,
  },
};

