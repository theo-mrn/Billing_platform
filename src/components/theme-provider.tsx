"use client"

import { useTheme } from "@/lib/themes"
import { useEffect } from "react"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("dark", "dark2", "dark3")
    root.classList.add(theme)
  }, [theme])

  return <>{children}</>
} 