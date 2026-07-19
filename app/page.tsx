'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

import {
  Features,
  FinalCTA,
  Footer,
  Hero,
  Nav,
  Pricing,
  WhatDoes,
  Why
} from '@/components/landing';

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

      <WhatDoes />

      <Features />

      <Pricing />

      <FinalCTA />

      <Footer />
    </div>
  );
}
