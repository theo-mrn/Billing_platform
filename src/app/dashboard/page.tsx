"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/pages/dashboard-stats"
import { ExpenseChart } from "@/components/pages/expense-chart"
import { UpcomingRenewals } from "@/components/pages/upcoming-renewals"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { MonthlyReportPDF } from "@/components/pages/monthly-report-pdf"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getExpenseChartData } from "@/app/actions/stats"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"

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
  const fileName = `rapport_depenses_${format(currentMonth, "MMMM_yyyy")}.pdf`

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-4">
          <PDFDownloadLink
            document={
              <MonthlyReportPDF
                currentMonth={currentMonth}
                subscriptions={currentMonthData?.subscriptions.map((sub: { name: string; amount: number; category: string }) => ({
                  ...sub,
                  id: sub.name,
                  renewalDate: currentMonth,
                  frequency: "MONTHLY",
                  status: "ACTIVE"
                })) || []}
              />
            }
            fileName={fileName}
            className="text-sm"
          >
            {({ loading }) => (
              <InteractiveHoverButton disabled={loading}>
                {loading ? "Génération..." : "Télécharger PDF"}
              </InteractiveHoverButton>
            )}
          </PDFDownloadLink>
        </div>
      </div>
      <div className="flex gap-4">
        <DashboardStats />
      </div>
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

