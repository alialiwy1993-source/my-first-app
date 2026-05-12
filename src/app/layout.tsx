import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AI Universal Assistant',
    template: '%s | AI Universal Assistant',
  },
  description: 'منصة استوديوهات الذكاء الاصطناعي — محادثة، مقالات، ترجمة، صور، صوت، أبحاث وأكثر',
  keywords: ['ذكاء اصطناعي', 'AI', 'كتابة', 'ترجمة', 'مقالات', 'ChatGPT', 'OpenAI'],
  authors: [{ name: 'AI Universal Assistant' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'AI Universal Assistant',
    title: 'AI Universal Assistant — منصة استوديوهات الذكاء الاصطناعي',
    description: 'منصة شاملة تجمع أدوات الذكاء الاصطناعي في مكان واحد',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
