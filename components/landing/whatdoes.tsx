import { ReactNode } from 'react';

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

export const WhatDoes = (): ReactNode => {
  return (
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
  );
};
