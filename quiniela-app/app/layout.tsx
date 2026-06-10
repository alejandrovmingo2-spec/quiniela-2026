import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Importante para hacer los botones

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiniela 2026",
  description: "Quiniela del Mundial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Este es nuestro nuevo menú de navegación */}
        {/* Nuestro menú de navegación limpio */}
        <nav className="bg-slate-900 text-white p-4 shadow-md">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 font-semibold text-sm md:text-base">
            <Link href="/" className="hover:text-blue-400 transition">⚽ Quiniela</Link>
            <Link href="/mis-pronosticos" className="hover:text-blue-400 transition">👀 Mis Pronósticos</Link>
            <Link href="/posiciones" className="hover:text-blue-400 transition">📊 Posiciones</Link>
            <Link href="/ranking" className="hover:text-blue-400 transition">🏆 Ranking</Link>
          </div>
        </nav>
        
        {/* Aquí se dibuja el resto de tus páginas */}
        {children}
      </body>
    </html>
  );
}