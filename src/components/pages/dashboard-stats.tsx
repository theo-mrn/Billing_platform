"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getDashboardStats, getExpenseChartData } from "@/app/actions/stats"

type Subscription = {
  id: string
  name: string
  category: string
  renewalDate: Date
  amount: number
  frequency: string
  status: string
  logo?: string | null
  description?: string | null
}

type ChartData = {
  month: string
  amount: number
  subscriptions: Array<{
    name: string
    amount: number
    category: string
  }>
}

export function DashboardStats() {
  const [stats, setStats] = useState<{
    totalAnnualExpense: number
    averageMonthlyExpense: number
    currentMonthExpense: number
    upcomingRenewals: Subscription[]
    activeSubscriptions: number
  } | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    const loadData = async () => {
      const [statsData, chartData] = await Promise.all([
        getDashboardStats(),
        getExpenseChartData()
      ])
      setStats(statsData)
      setChartData(chartData)
    }
    loadData()
  }, [])

  if (!stats || !chartData.length) {
    return <div>Chargement des statistiques...</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
      <Card className="p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground">Dépenses annuelles</p>
          <p className="text-lg sm:text-2xl font-bold">{stats.totalAnnualExpense.toFixed(2)} €</p>
        </div>
      </Card>
      <Card className="p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground">Moyenne mensuelle</p>
          <p className="text-lg sm:text-2xl font-bold">{stats.averageMonthlyExpense.toFixed(2)} €</p>
        </div>
      </Card>
      <Card className="p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground">Ce mois</p>
          <p className="text-lg sm:text-2xl font-bold">{stats.currentMonthExpense.toFixed(2)} €</p>
        </div>
      </Card>
      <Card className="p-3 sm:p-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground">Abonnements actifs</p>
          <p className="text-lg sm:text-2xl font-bold">{stats.activeSubscriptions}</p>
        </div>
      </Card>
    </div>
  )
}

