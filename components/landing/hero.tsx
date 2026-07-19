'use client';
import { ReactNode } from 'react';
import { SignUpButton } from '@clerk/nextjs';

export const Hero = (): ReactNode => {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-5 py-12 text-center sm:py-16 lg:py-24">
      <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        Your private, searchable knowledge base
      </div>
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl [text-wrap:pretty]">
        Every idea buried in your recordings,{' '}
        <span className="text-brand-600">instantly findable.</span>
      </h1>
      <p className="max-w-xl text-lg text-muted sm:text-xl">
        AlwaysSaved transforms podcasts, Zoom calls, lectures, interviews, and
        YouTube videos into searchable, AI-understandable knowledge. Upload
        once, ask questions forever.
      </p>

      <div className="mt-2 flex w-full max-w-md flex-wrap justify-center gap-2.5">
        <SignUpButton>
          <button className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Sign Up &#47; Sign In
          </button>
        </SignUpButton>
      </div>

      <p className="text-xs text-muted">
        No credit card required · Cancel anytime
      </p>

      <div className="mt-8 w-full max-w-3xl rounded-2xl border border-line bg-white p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.4)] sm:p-7">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <div className="ml-3 flex-1 truncate rounded-md bg-cream px-3 py-1.5 font-mono text-xs text-muted">
            &quot;what did the speaker say about market trends?&quot;
          </div>
        </div>
        <div className="mt-3.5 flex flex-col gap-2">
          <div className="h-3 w-[90%] rounded-md bg-cream" />
          <div className="h-3 w-[75%] rounded-md bg-cream" />
          <div className="h-3 w-[60%] rounded-md bg-cream" />
        </div>
        <div className="mt-3 border-t border-dashed border-line pt-2.5 font-mono text-xs text-muted">
          [ product preview ]
        </div>
      </div>
    </section>
  );
};
