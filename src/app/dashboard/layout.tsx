"use client"

import Link from "next/link"
import { BarChart3, CreditCard, Home, CalendarDays, Wallet, PiggyBank } from "lucide-react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/sections/Header"

const navigationItems = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Revenus",
    href: "/dashboard/income",
    icon: PiggyBank,
  },
  {
    title: "Abonnements",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Calendrier",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    title: "Bilan",
    href: "/dashboard/balance",
    icon: Wallet,
  },
  {
    title: "Rapports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
]

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
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 