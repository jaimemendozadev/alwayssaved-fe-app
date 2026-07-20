import { ReactNode } from 'react';

export const Why = (): ReactNode => {
  return (
    <section id="why-alwayssaved" className="bg-line/20 px-5 py-14 sm:py-20 lg:px-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-3.5 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          Why AlwaysSaved?
        </h2>
        <p className="text-lg text-muted [text-wrap:pretty]">
          Information should never be lost in a 90-minute content file.
          AlwaysSaved turns your media library into a second brain — one you can
          ask questions of, forever.
        </p>
      </div>
    </section>
  );
};
