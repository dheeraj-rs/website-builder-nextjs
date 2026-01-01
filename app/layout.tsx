import type { Metadata } from 'next';

import { stripIndents } from '~/utils/stripIndent';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import '@xterm/xterm/css/xterm.css';

export const metadata: Metadata = {
  title: 'D Admin - AI Website Builder',
  description: 'AI-powered full-stack web development in the browser',
};

const inlineThemeCode = stripIndents`
  setBuilderTheme();

  function setBuilderTheme() {
    let theme = localStorage.getItem('builder_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
      </head>
      <body>
        <div id="root" className="w-full h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
