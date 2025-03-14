import type React from "react"
import type { Metadata } from "next"
import './globals.css'

import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers/Providers"
import { ThemeProvider } from "@/components/providers/theme-provider"



export const metadata: Metadata = {
  title: "Theo MORIN | Développeur Web",
  description: "Portfolio de Théo MORIN, développeur web spécialisé en React et Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/favicon/image.png" />
      </head>
      <body  suppressHydrationWarning>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
} 