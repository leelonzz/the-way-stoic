import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Inknut_Antiqua, Inika } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'

const inknutAntiqua = Inknut_Antiqua({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inknut-antiqua',
})

const inika = Inika({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inika',
})


export const metadata: Metadata = {
  title: 'The Stoic Way - Philosophy for Daily Life',
  description:
    'Transform your daily practice with ancient Stoic wisdom. Build resilience, find clarity, and cultivate inner strength through guided reflection and timeless teachings.',
  generator: 'v0.dev',
  icons: {
    icon: '/placeholder.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): JSX.Element {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/placeholder.svg" type="image/svg+xml" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inika:wght@400;700&display=swap"
          as="style"
        />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-inknut-antiqua: ${inknutAntiqua.style.fontFamily};
  --font-inika: ${inika.style.fontFamily};
}

/* Font loading detection and management */
.font-loading-manager {
  --font-display: system-ui, -apple-system, sans-serif;
  --font-editing: system-ui, -apple-system, sans-serif;
  --font-display-loaded: var(--font-inknut-antiqua), serif;
}

/* Typography debugging utilities */
.debug-typography {
  position: relative;
}

.debug-typography::after {
  content: attr(data-font-state);
  position: absolute;
  top: -20px;
  right: 0;
  font-size: 10px;
  color: red;
  background: rgba(255,255,255,0.8);
  padding: 2px 4px;
  border-radius: 2px;
  z-index: 1000;
  pointer-events: none;
}
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Font loading detection with debugging
            window.fontLoadingDebug = {
              inknutLoaded: false,
              editingStates: new Map(),
              log: function(msg) {
                console.log('[FONT-DEBUG]', msg);
              }
            };

            // Detect when Inknut Antiqua is loaded
            if ('fonts' in document) {
              document.fonts.ready.then(() => {
                window.fontLoadingDebug.log('Fonts ready - checking Inknut Antiqua');
                
                // Try different font check variations
                const fontCheck1 = document.fonts.check('16px "Inknut Antiqua"');
                const fontCheck2 = document.fonts.check('16px Inknut Antiqua');
                
                window.fontLoadingDebug.log('Font check 1 (quoted): ' + fontCheck1);
                window.fontLoadingDebug.log('Font check 2 (unquoted): ' + fontCheck2);
                
                const loaded = fontCheck1 || fontCheck2;
                window.fontLoadingDebug.inknutLoaded = loaded;
                window.fontLoadingDebug.log('Inknut Antiqua loaded: ' + loaded);
                
                if (loaded) {
                  document.documentElement.classList.add('inknut-loaded');
                  window.dispatchEvent(new CustomEvent('inknut-font-loaded'));
                } else {
                  // Wait a bit more and try again
                  setTimeout(() => {
                    const retryCheck = document.fonts.check('16px "Inknut Antiqua"') || document.fonts.check('16px Inknut Antiqua');
                    window.fontLoadingDebug.log('Retry font check: ' + retryCheck);
                    if (retryCheck) {
                      window.fontLoadingDebug.inknutLoaded = true;
                      document.documentElement.classList.add('inknut-loaded');
                      window.dispatchEvent(new CustomEvent('inknut-font-loaded'));
                    }
                  }, 1000);
                }
              });
            }

            // Legacy font loading detection
            const testSpan = document.createElement('span');
            testSpan.style.fontFamily = '"Inknut Antiqua", serif';
            testSpan.style.fontSize = '16px';
            testSpan.style.position = 'absolute';
            testSpan.style.visibility = 'hidden';
            testSpan.textContent = 'Test';
            document.body.appendChild(testSpan);

            const checkFontLoad = () => {
              const computedStyle = window.getComputedStyle(testSpan);
              if (computedStyle.fontFamily.includes('Inknut')) {
                window.fontLoadingDebug.inknutLoaded = true;
                window.fontLoadingDebug.log('Inknut Antiqua detected via computed style');
                document.documentElement.classList.add('inknut-loaded');
                window.dispatchEvent(new CustomEvent('inknut-font-loaded'));
                document.body.removeChild(testSpan);
              } else {
                setTimeout(checkFontLoad, 100);
              }
            };
            setTimeout(checkFontLoad, 100);
          `,
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${inknutAntiqua.variable} ${inika.variable}`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
