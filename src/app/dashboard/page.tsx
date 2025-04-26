"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/pages/dashboard-stats"
import { ExpenseChart } from "@/components/pages/expense-chart"
import { UpcomingRenewals } from "@/components/pages/upcoming-renewals"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getExpenseChartData } from "@/app/actions/stats"
import dynamic from "next/dynamic"

// Dynamically import the PDFDownloadButton with no SSR
const PDFDownloadButton = dynamic(
  () => import("@/components/pages/pdf-download-button").then((mod) => mod.PDFDownloadButton),
  { ssr: false }
)

type ChartData = {
  month: string
  amount: number
  subscriptions: Array<{
    name: string
    amount: number
    category: string
  }>
}

export default function DashboardPage() {
  const [showAllRenewals, setShowAllRenewals] = useState(false)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const currentMonth = new Date()

  useEffect(() => {
    const loadChartData = async () => {
      const data = await getExpenseChartData()
      setChartData(data)
    }
    loadChartData()
  }, [])

  // Trouver les données du mois en cours
  const currentMonthData = chartData.find(
    month => month.month.toLowerCase() === format(currentMonth, "MMMM", { locale: fr }).toLowerCase()
  )

  return (
    <div className="flex flex-col gap-2 sm:gap-4 w-full p-2 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-4">
          <PDFDownloadButton 
            currentMonth={currentMonth}
            subscriptions={currentMonthData?.subscriptions || []}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full sm:flex-row">
        <DashboardStats />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr,300px] gap-2 sm:gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Dépenses mensuelles</CardTitle>
            <CardDescription>Évolution de vos dépenses d&apos;abonnement sur les 12 derniers mois</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ExpenseChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Détail des dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 border-l pl-3">
              {chartData.map((month) => (
                <div key={month.month} className="flex justify-between items-center text-sm py-1">
                  <span className="capitalize text-muted-foreground">{month.month}</span>
                  <span className="font-medium">{month.amount.toLocaleString('fr-FR')} €</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Prochains renouvellements</CardTitle>
            <CardDescription>Abonnements à renouveler prochainement</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setShowAllRenewals(true)}>
            Voir plus
          </Button>
        </CardHeader>
        <CardContent>
          <UpcomingRenewals limit={3} />
        </CardContent>
      </Card>

      <Dialog open={showAllRenewals} onOpenChange={setShowAllRenewals}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Tous les prochains renouvellements</DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
            <UpcomingRenewals limit={0} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

