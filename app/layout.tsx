import './globals.css'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pokémon Tournament Manager',
  description: 'Manage and participate in Pokémon Trading Card Game tournaments',
  manifest: '/manifest.json',
  themeColor: '#ef4444',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    apple: '/icons/icon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Theme appearance="light" accentColor="red" radius="medium">
          {children}
        </Theme>
      </body>
    </html>
  )
} 