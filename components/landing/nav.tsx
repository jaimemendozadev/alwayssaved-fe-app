'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { Show, SignUpButton, SignOutButton } from '@clerk/nextjs';

// 7-19-26 TODO: Restore link to Pricing section as soon as pricing/memberships are implemented.

export const Nav = (): ReactNode => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 border-b border-line sm:px-8 lg:px-16">
      <div className="flex items-center gap-2.5">
        <Image
          src="/alwayssaved-logo-mark.png"
          alt="AlwaysSaved logo"
          width={34}
          height={34}
          className="rounded-[10px] object-cover"
        />
        <span className="text-xl font-bold">AlwaysSaved</span>
      </div>
      <nav className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
        <a href="#why-alwayssaved" className="text-sm text-muted hover:text-ink">
          Why AlwaysSaved?
        </a>
        <a href="#what-it-does" className="text-sm text-muted hover:text-ink">
          What it does
        </a>
        <a href="#features" className="text-sm text-muted hover:text-ink">
          Key features
        </a>
        {/* <a href="#pricing" className="text-sm text-muted hover:text-ink">
          Pricing
        </a> */}
        <Show when="signed-in">
          <SignOutButton>
            <button className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              Sign Out
            </button>
          </SignOutButton>
        </Show>
        <Show when="signed-out">
          <SignUpButton>
            <button className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              Sign Up &#47; Sign In
            </button>
          </SignUpButton>
        </Show>
      </nav>
    </header>
  );
};
