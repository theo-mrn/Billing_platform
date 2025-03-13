"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats } from "@/app/actions/stats"

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

export function UpcomingRenewals() {
  const [upcomingRenewals, setUpcomingRenewals] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRenewals = async () => {
      try {
        const data = await getDashboardStats()
        setUpcomingRenewals(data.upcomingRenewals)
      } catch (error) {
        console.error("Erreur lors du chargement des renouvellements:", error)
      } finally {
        setLoading(false)
      }
    }
    loadRenewals()
  }, [])

  if (loading) {
    return <div>Chargement des renouvellements...</div>
  }

  if (!upcomingRenewals.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prochains renouvellements</CardTitle>
          <CardDescription>Aucun renouvellement prévu</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prochains renouvellements</CardTitle>
        <CardDescription>Vos abonnements à renouveler prochainement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingRenewals.map((subscription) => (
            <div key={subscription.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{subscription.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(subscription.renewalDate), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{subscription.amount.toFixed(2)} €</p>
                <p className="text-sm text-muted-foreground">
                  {subscription.frequency === "MONTHLY"
                    ? "Mensuel"
                    : subscription.frequency === "QUARTERLY"
                    ? "Trimestriel"
                    : subscription.frequency === "SEMI_ANNUAL"
                    ? "Semestriel"
                    : "Annuel"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

