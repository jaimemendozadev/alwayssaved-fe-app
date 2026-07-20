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
  WhatDoes,
  Why
} from '@/components/landing';


// 7-19-26 TODO: Figure out pricing/memberships and reimplement <Pricing /> on landing page.

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

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

      <FinalCTA />

      <Footer />
    </div>
  );
}
