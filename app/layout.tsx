import { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../src/components/theme-provider';

export const metadata: Metadata = {
  title: 'AWS DevOps Quiz App',
  description: 'Prepare for your AWS Certified DevOps Engineer Professional exam with 350+ practice questions',
  keywords: 'AWS, DevOps, certification, exam, practice, quiz',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-slate-900 text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
