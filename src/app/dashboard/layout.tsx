"use client"

import Link from "next/link"
import { BarChart3, CreditCard, Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/sections/Header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="grid flex-1 md:grid-cols-[220px_1fr] pt-16">
        <aside className="hidden border-r bg-muted/40 md:block">
          <nav className="grid gap-6 p-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 ${
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Home className="h-5 w-5" />
              Tableau de bord
            </Link>
            <Link
              href="/dashboard/subscriptions"
              className={`flex items-center gap-3 ${
                pathname === "/dashboard/subscriptions" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <CreditCard className="h-5 w-5" />
              Abonnements
            </Link>
            <Link
              href="/dashboard/reports"
              className={`flex items-center gap-3 ${
                pathname === "/dashboard/reports" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              Rapports
            </Link>
          </nav>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 