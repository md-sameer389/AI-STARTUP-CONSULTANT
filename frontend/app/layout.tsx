import type { Metadata } from 'next';
import './globals.css';
import NavbarWrapper from './components/NavbarWrapper';

export const metadata: Metadata = {
  title: 'StartupAI — Multi-Agent Strategic Business Planner',
  description: 'Instantly generate professional, investor-ready business plans using a pipeline of 7 specialized AI agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-textPrimary min-h-screen flex flex-col grid-bg">
        {/* Navbar is rendered via a client wrapper to allow localStorage access */}
        <NavbarWrapper />

        {/* Main Content */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-borderColor py-8 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="font-semibold text-sm text-textSecondary">
                © {new Date().getFullYear()} StartupAI Inc. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-textSecondary">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition-colors">Contact Support</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
