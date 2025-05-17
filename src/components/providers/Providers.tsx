'use client'

import { ThemeProvider } from "@/components/providers/theme-provider"
import { SessionProvider } from "next-auth/react"
import { OrganizationProvider } from "@/contexts/OrganizationContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <OrganizationProvider>
          {children}
        </OrganizationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 