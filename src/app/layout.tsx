import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { ThemeProvider } from '@/lib/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import './globals.css'
import './debug.css'

export const metadata: Metadata = {
  title: 'Hooks Log',
  description: 'Claude Hooks Log Viewer',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        {/* See: https://chatgpt.com/c/681ca606-b550-8001-88c7-84fe99e7dcaf */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href='https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=optional'
          rel='stylesheet'
        />
      </head>
      <body>
        <ThemeProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
