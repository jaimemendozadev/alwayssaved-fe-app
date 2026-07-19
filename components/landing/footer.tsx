import { ReactNode } from 'react';
import Image from 'next/image';

export const Footer = (): ReactNode => {
  return (
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
  );
};
