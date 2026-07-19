'use client';
import { ReactNode } from 'react';
import { SignUpButton } from '@clerk/nextjs';

export const FinalCTA = (): ReactNode => {
  return (
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
  );
};
