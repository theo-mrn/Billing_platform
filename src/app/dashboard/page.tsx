"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/pages/dashboard-stats"
import { ExpenseChart } from "@/components/pages/expense-chart"
import { UpcomingRenewals } from "@/components/pages/upcoming-renewals"

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-4">
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Dépenses mensuelles</CardTitle>
            <CardDescription>Évolution de vos dépenses d&apos;abonnement sur les 12 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseChart />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Prochains renouvellements</CardTitle>
            <CardDescription>Abonnements à renouveler prochainement</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingRenewals />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

