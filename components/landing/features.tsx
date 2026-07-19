import { ReactNode } from 'react';

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

export const Features = (): ReactNode => {
  return (
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
  );
};
