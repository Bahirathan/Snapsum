// Single Source of Truth for Zipytiny Pricing Plans
// Centralized configuration for pricing cards, checkout flows, SEO metadata, and AI assistant prompts.

export interface PricingPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  displayPrice: string;
  period: 'forever' | 'month' | 'mo';
  billingInterval: 'forever' | 'monthly' | 'yearly';
  priceId: string | null; // Placeholder for real Stripe price IDs
  description: string;
  features: string[];
  popular?: boolean;
}

export interface PricingConfig {
  free: PricingPlan;
  pro: PricingPlan;
  enterprise: PricingPlan;
}

export const PRICING_CONFIG: PricingConfig = {
  free: {
    id: 'free',
    name: 'Free Workspace',
    price: 0,
    displayPrice: '$0',
    period: 'forever',
    billingInterval: 'forever',
    priceId: null, // Fill in Stripe Price ID when available
    description: 'Free study workspace with core AI note generation and summary capabilities.',
    features: [
      '3 video summaries/week',
      'Flashcards & quizzes',
      'Standard processing speed',
      'YouTube & web article digests'
    ],
    popular: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 9.99,
    displayPrice: '$9.99',
    period: 'mo',
    billingInterval: 'monthly',
    priceId: null, // Fill in Stripe Price ID when available
    description: 'Unlimited video, PDF & document uploads, mind maps, quiz generator, PowerPoint & Anki exports, high-speed Gemini Flash engine.',
    features: [
      'Unlimited video/PDF/document uploads',
      'Interactive visual mind maps',
      'AI practice quiz generator',
      'PowerPoint & Anki flashcard exports',
      'High-speed Gemini Flash engine',
      'Unlimited Socratic AI Tutor Chat'
    ],
    popular: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 39,
    displayPrice: '$39',
    period: 'mo',
    billingInterval: 'monthly',
    priceId: null, // Fill in Stripe Price ID when available
    description: 'Team workspaces, high-speed processing, dedicated support, API access.',
    features: [
      'Team workspaces & shared folders',
      'High-speed processing queue',
      'Dedicated support & onboarding',
      'API access & webhooks',
      'Custom branding & white-label exports'
    ],
    popular: false,
  },
};

// Convenient exports for legacy string references & components
export const FREE_PLAN_PRICE = PRICING_CONFIG.free.price.toString(); // "0"
export const PRO_PLAN_MONTHLY_PRICE = PRICING_CONFIG.pro.price.toFixed(2); // "9.99"
export const PRO_PLAN_ANNUAL_MONTHLY_PRICE = "6.99"; // Billed annually option if enabled
export const ENTERPRISE_PLAN_MONTHLY_PRICE = PRICING_CONFIG.enterprise.price.toFixed(2); // "39.00"
