import { ReactNode } from 'react';

export default function HomePageLayout({
  children
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <div className="flex">
      <div className="w-[15%] bg-[#f9f9f9] min-h-screen"></div>

      {children}
    </div>
  );
}
