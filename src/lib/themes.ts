import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'dark2' | 'dark3'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)

export const themes: Record<Theme, string> = {
  dark: 'dark',
  dark2: 'dark2',
  dark3: 'dark3',
} 