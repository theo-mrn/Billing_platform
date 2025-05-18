import type { Metadata } from "next"
import './globals.css'
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers/Providers"
import { ThemeProvider } from "next-themes"
import { MusicProvider } from "@/contexts/MusicContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Billing Platform",
  description: "A modern billing platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/favicon/image.png" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} w-full h-full`} suppressHydrationWarning>
        <Providers>
          <ThemeProvider attribute="data-color-mode">
            <MusicProvider>
              <div className="min-h-screen w-full">
                {children}
              </div>
            </MusicProvider>
          </ThemeProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
} 