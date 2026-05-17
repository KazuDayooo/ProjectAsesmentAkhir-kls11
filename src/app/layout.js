import { Outfit } from "next/font/google";
import './globals.css';
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'Konekko Services — Portal Pengaduan Masyarakat',
  description: 'Layanan pengaduan masyarakat berbasis chat: fasilitas publik, pendidikan, dan keamanan kota.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning className={outfit.className}>
      <body className="antialiased selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
