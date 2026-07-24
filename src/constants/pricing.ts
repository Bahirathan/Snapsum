// Single Source of Truth for Zipytiny Pricing Plans
// Verification Note for Stripe Dashboard Sync:
// - Free Plan: $0.00 / forever
// - Pro Plan Monthly: $9.99 / month
// - Pro Plan Annual: $6.99 / month ($83.88 / year)
// - Enterprise Plan Monthly: $39.00 / month

export const FREE_PLAN_PRICE = "0.00";
export const PRO_PLAN_MONTHLY_PRICE = "9.99";
export const PRO_PLAN_ANNUAL_MONTHLY_PRICE = "6.99";
export const ENTERPRISE_PLAN_MONTHLY_PRICE = "39.00";

export const PRICING_SUMMARY = {
  free: {
    price: FREE_PLAN_PRICE,
    displayPrice: "$0",
    period: "forever",
    description: "Free study workspace with core AI note generation and summary capabilities."
  },
  pro: {
    monthlyPrice: PRO_PLAN_MONTHLY_PRICE,
    annualMonthlyPrice: PRO_PLAN_ANNUAL_MONTHLY_PRICE,
    displayPriceMonthly: "$9.99",
    displayPriceAnnual: "$6.99",
    description: "Unlimited video, PDF & document uploads, mind maps, quizzes, and video-to-PowerPoint export."
  },
  enterprise: {
    price: ENTERPRISE_PLAN_MONTHLY_PRICE,
    displayPrice: "$39.00",
    period: "month",
    description: "Team workspaces, high-speed processing, dedicated support and API access."
  }
};
