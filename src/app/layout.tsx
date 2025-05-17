import type { Metadata } from "next"
import './globals.css'
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers/Providers"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Yner",
  description: "Un outil pour gerer vos abonnements",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/favicon/image.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
} 