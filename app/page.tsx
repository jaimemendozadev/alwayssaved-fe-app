'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Show, SignUpButton, SignOutButton, useUser } from '@clerk/nextjs';

import { Hero, Nav, Why } from '@/components/landing';

const HOW_IT_WORKS = [
  {
    title: 'Transcribe',
    desc: 'Speech converted to accurate, readable text using Whisper.'
  },
  {
    title: 'Index',
    desc: 'Everything indexed in a vector database for fast semantic search.'
  },
  {
    title: 'Answer',
    desc: 'Ask natural-language questions, get answers sourced from your content.'
  }
];

const FEATURES = [
  {
    title: 'Drag-and-Drop Simplicity',
    desc: 'Upload a video or audio file and let the AI handle the rest.'
  },
  {
    title: 'Private Semantic Search',
    desc: 'Search your files like Google — but faster, smarter, and fully private.'
  },
  {
    title: 'Ask Anything',
    desc: '"What did the speaker say about market trends?" — get the exact answer, sourced from your content.'
  },
  {
    title: 'Multilingual Support',
    desc: 'Works with English, Spanish, and other supported languages.'
  },
  {
    title: 'Lightning-Fast GPU Processing',
    desc: 'Powered by NVIDIA hardware in the cloud for speedy results.'
  }
];

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

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  if (isSignedIn) router.push('/home');

  useEffect(() => {
    if (isSignedIn) router.push('/home');
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen bg-cream text-ink">

      <Nav />
      
      <Hero />

      <Why />
      

      {/* WHAT IT DOES */}
      <section
        id="what-it-does"
        className="flex flex-col items-center gap-10 px-5 py-16 sm:py-20 lg:px-16 lg:py-24"
      >
        <div className="flex max-w-xl flex-col gap-2.5 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">What it does</h2>
          <p className="text-muted">
            Turns your personal video and audio files into smart, searchable
            documents — no manual note-taking, no rewatching.
          </p>
        </div>
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.title}
              className="flex flex-col items-center gap-3.5 rounded-2xl border border-line bg-white p-7 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                <div className="h-6 w-6 rounded-full border-4 border-brand-500" />
              </div>
              <h3 className="font-bold">{step.title}</h3>
              <p className="text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="flex flex-col items-center gap-10 bg-line/20 px-5 py-16 sm:py-20 lg:px-16 lg:py-24"
      >
        <h2 className="text-3xl font-extrabold sm:text-4xl">Key features</h2>
        <div className="grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3.5 rounded-2xl border border-line bg-white p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
                <div className="h-5 w-5 rounded-full border-2 border-white" />
              </div>
              <h3 className="font-bold">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="flex flex-col items-center gap-10 px-5 py-16 sm:py-20 lg:px-16 lg:py-24"
      >
        <div className="flex max-w-xl flex-col gap-2.5 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Simple pricing
          </h2>
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

      {/* FINAL CTA */}
      <section
        id="signup"
        className="flex flex-col items-center gap-5 bg-ink px-5 py-16 text-center text-white sm:py-20 lg:px-16 lg:py-24"
      >
        <h2 className="max-w-xl text-3xl font-extrabold sm:text-4xl">
          Stop losing ideas to unwatched recordings.
        </h2>
        <p className="max-w-lg text-white/75">
          Upload once, ask questions forever. Get started free today.
        </p>
        <SignUpButton>
          <button className="rounded-lg bg-brand-600 px-7 py-3.5 text-sm font-bold hover:bg-brand-500">
            Start free
          </button>
        </SignUpButton>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-8 sm:px-8 lg:px-16">
        <div className="flex items-center gap-2">
          <Image
            src="/alwayssaved-logo-mark.png"
            alt="AlwaysSaved logo"
            width={22}
            height={22}
            className="rounded-[7px] object-cover"
          />
          <span className="text-sm font-bold text-muted">AlwaysSaved</span>
        </div>
        <span className="text-xs text-muted">
          © 2026 AlwaysSaved. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
