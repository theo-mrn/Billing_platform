"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats } from "@/app/actions/stats"

type DashboardStats = {
  totalMonthlyExpenses: number
  activeSubscriptions: number
  upcomingRenewals: Array<{
    id: string
    name: string
    category: string
    renewalDate: Date
    amount: number
    frequency: string
    status: string
    logo?: string | null
    description?: string | null
  }>
  mainCategory: {
    category: string
    total: number
  }
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return <div>Chargement des statistiques...</div>
  }

  if (!stats) {
    return <div>Aucune donnée disponible</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dépenses mensuelles totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMonthlyExpenses.toFixed(2)} €</div>
          <p className="text-xs text-muted-foreground">
            Total des dépenses d&apos;abonnement pour le mois en cours
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            Nombre d&apos;abonnements actuellement en cours
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prochains renouvellements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingRenewals.length}</div>
          <p className="text-xs text-muted-foreground">
            {stats.upcomingRenewals.length > 0 ? (
              <>
                Prochain renouvellement le{" "}
                {format(new Date(stats.upcomingRenewals[0].renewalDate), "d MMMM yyyy", { locale: fr })}
              </>
            ) : (
              "Aucun renouvellement prévu"
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Catégorie principale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mainCategory.category || "Aucune"}</div>
          <p className="text-xs text-muted-foreground">
            {stats.mainCategory.total ? `${stats.mainCategory.total.toFixed(2)} €` : "Aucune dépense"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

