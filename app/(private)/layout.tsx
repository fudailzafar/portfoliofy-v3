import type React from 'react';
import { Footer } from '../../components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="flex-1 flex flex-col min-h-[calc(100vh-200px)]">
        {children}
      </section>
    </>
  );
}
