import React, { useState } from 'react';
import { PRICING_CONFIG, PRO_PLAN_ANNUAL_MONTHLY_PRICE } from '../config/pricing.config';
import { CheckCircle, Zap, Shield, Sparkles } from 'lucide-react';

interface PricingCardsProps {
  onSelectPlan: (planCode: 'pro' | 'enterprise') => void;
  onLaunchFree?: () => void;
  isAnnualDefault?: boolean;
  isCompact?: boolean;
}

export const PricingCards: React.FC<PricingCardsProps> = ({
  onSelectPlan,
  onLaunchFree,
  isAnnualDefault = false,
  isCompact = false,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(isAnnualDefault ? 'yearly' : 'monthly');
  const isAnnual = billingCycle === 'yearly';

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-neutral-100 dark:bg-zinc-800 p-1 rounded-xl inline-flex items-center gap-1 border border-neutral-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              !isAnnual
                ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-zinc-50 shadow-sm'
                : 'text-neutral-500 dark:text-zinc-400 hover:text-neutral-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              isAnnual
                ? 'bg-white dark:bg-zinc-900 text-neutral-900 dark:text-zinc-50 shadow-sm'
                : 'text-neutral-500 dark:text-zinc-400 hover:text-neutral-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono px-1.5 py-0.5 rounded-full font-extrabold uppercase">
              Save 30%
            </span>
          </button>
        </div>
      </div>

      {/* Grid of 3 Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch">
        
        {/* FREE WORKSPACE CARD */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-neutral-400">
              Standard Entry
            </span>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-zinc-50 font-display">
              {PRICING_CONFIG.free.name}
            </h3>

            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-4xl font-extrabold font-display text-neutral-900 dark:text-zinc-50">
                {PRICING_CONFIG.free.displayPrice}
              </span>
              <span className="text-xs text-[#86868b] font-medium font-mono uppercase">
                / {PRICING_CONFIG.free.period}
              </span>
            </div>

            <p className="text-xs text-[#86868b] dark:text-zinc-400 font-light leading-relaxed min-h-[36px]">
              {PRICING_CONFIG.free.description}
            </p>

            <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-zinc-300 pt-4 border-t border-neutral-100 dark:border-zinc-800">
              {PRICING_CONFIG.free.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onLaunchFree ? onLaunchFree() : window.location.href = '/'}
            className="mt-8 w-full py-3.5 bg-neutral-900 dark:bg-zinc-800 hover:bg-black text-white rounded-xl text-xs font-extrabold transition cursor-pointer text-center shadow-md active:scale-98"
          >
            Start Free — No Card Required
          </button>
        </div>

        {/* PRO PLAN CARD */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#0071e3] p-6 sm:p-8 rounded-2xl relative flex flex-col justify-between shadow-lg">
          <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/15">
            {isAnnual ? 'Save 30%' : 'Most Popular'}
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#0071e3] flex items-center gap-1">
              <Zap className="w-3 h-3 fill-[#0071e3]" /> Unlimited Suite
            </span>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-zinc-50 font-display">
              {PRICING_CONFIG.pro.name}
            </h3>

            <div className="flex flex-col pt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-display text-neutral-900 dark:text-zinc-50">
                  {isAnnual ? `$${PRO_PLAN_ANNUAL_MONTHLY_PRICE}` : PRICING_CONFIG.pro.displayPrice}
                </span>
                <span className="text-xs text-[#86868b] font-medium font-mono uppercase">/ month</span>
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-zinc-400 font-mono font-bold uppercase mt-1">
                {isAnnual ? `$${(Number(PRO_PLAN_ANNUAL_MONTHLY_PRICE) * 12).toFixed(2)} billed annually` : 'Billed monthly'}
              </span>
            </div>

            <p className="text-xs text-[#86868b] dark:text-zinc-400 font-light leading-relaxed min-h-[36px]">
              {PRICING_CONFIG.pro.description}
            </p>

            <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-zinc-300 pt-4 border-t border-neutral-100 dark:border-zinc-800">
              {PRICING_CONFIG.pro.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#0071e3] shrink-0" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onSelectPlan('pro')}
            className="mt-8 w-full py-3.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-extrabold transition cursor-pointer text-center shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Upgrade to Pro Now</span>
          </button>
        </div>

        {/* ENTERPRISE PLAN CARD */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              Team Workspaces
            </span>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-zinc-50 font-display">
              {PRICING_CONFIG.enterprise.name}
            </h3>

            <div className="flex flex-col pt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-display text-neutral-900 dark:text-zinc-50">
                  {PRICING_CONFIG.enterprise.displayPrice}
                </span>
                <span className="text-xs text-[#86868b] font-medium font-mono uppercase">/ month</span>
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-zinc-400 font-mono font-bold uppercase mt-1">
                Billed monthly
              </span>
            </div>

            <p className="text-xs text-[#86868b] dark:text-zinc-400 font-light leading-relaxed min-h-[36px]">
              {PRICING_CONFIG.enterprise.description}
            </p>

            <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-zinc-300 pt-4 border-t border-neutral-100 dark:border-zinc-800">
              {PRICING_CONFIG.enterprise.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onSelectPlan('enterprise')}
            className="mt-8 w-full py-3.5 bg-neutral-900 dark:bg-zinc-800 hover:bg-black text-white rounded-xl text-xs font-extrabold transition cursor-pointer text-center shadow-md active:scale-98"
          >
            Upgrade to Enterprise
          </button>
        </div>

      </div>
    </div>
  );
};
