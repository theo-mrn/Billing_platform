"use client"

import { SessionNavBar } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid flex-1">
        <SessionNavBar />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 ml-[3.05rem]">
          {children}
        </main>
      </div>
    </div>
  )
} 