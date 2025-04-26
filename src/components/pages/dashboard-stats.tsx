"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Dépenses annuelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAnnualExpense.toFixed(2)} €</div>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Dépenses mensuelles moyennes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageMonthlyExpense.toFixed(2)} €</div>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Dépenses du mois en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentMonthExpense.toFixed(2)} €</div>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Abonnements actifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
        </CardContent>
      </Card>
    </>
  )
}

