'use client';
import { ReactNode } from 'react';
import { SignUpButton } from '@clerk/nextjs';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    highlight: false,
    tagline: 'Try it on your first few files.',
    perks: [
      '5 hours of processing / month',
      'English transcription',
      '7-day file retention',
      'Semantic search'
    ]
  },
  {
    name: 'Pro',
    price: '$15',
    period: '/month',
    highlight: true,
    tagline: 'For creators and researchers with growing libraries.',
    perks: [
      '50 hours of processing / month',
      'Multilingual transcription',
      'Unlimited retention',
      'Priority GPU processing'
    ]
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    highlight: false,
    tagline: 'Shared knowledge base for your whole team.',
    perks: [
      'Unlimited processing hours',
      'Shared team workspace',
      'Team-wide search & Q&A',
      'Priority support'
    ]
  }
];

export const Pricing = (): ReactNode => {
  return (
    <section
      id="pricing"
      className="flex flex-col items-center gap-10 px-5 py-16 sm:py-20 lg:px-16 lg:py-24"
    >
      <div className="flex max-w-xl flex-col gap-2.5 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Simple pricing</h2>
        <p className="text-muted">
          Start free. Upgrade when your library grows.
        </p>
      </div>
      <div className="grid w-full max-w-5xl grid-cols-1 items-stretch gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col gap-3 rounded-2xl bg-white p-7 ${
              plan.highlight
                ? 'border-2 border-brand-600 shadow-[0_20px_40px_-28px_rgba(58,91,218,0.6)]'
                : 'border border-line'
            }`}
          >
            {plan.highlight && (
              <span className="w-fit rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white">
                Most popular
              </span>
            )}
            <h3 className="text-xl font-extrabold">{plan.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="text-sm text-muted">{plan.period}</span>
            </div>
            <p className="text-sm text-muted">{plan.tagline}</p>
            <div className="mt-2 flex flex-col gap-2.5">
              {plan.perks.map((perk) => (
                <div key={perk} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-600" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
            <SignUpButton>
              <button
                className={`mt-auto rounded-lg px-5 py-3 text-sm font-bold ${
                  plan.highlight
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'border border-line bg-cream hover:bg-line/40'
                }`}
              >
                {plan.highlight
                  ? 'Start free trial'
                  : plan.name === 'Team'
                    ? 'Contact sales'
                    : 'Get started'}
              </button>
            </SignUpButton>
          </div>
        ))}
      </div>
    </section>
  );
};
