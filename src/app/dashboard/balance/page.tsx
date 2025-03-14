"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { getIncomes } from "@/app/actions/incomes"
import { getSubscriptions } from "@/app/actions/subscriptions"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

type MonthlyBalance = {
  month: string
  incomes: number
  expenses: number
  balance: number
}

export default function BalancePage() {
  const { data: session, status } = useSession()
  const [monthlyBalances, setMonthlyBalances] = useState<MonthlyBalance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBalanceData = async () => {
      if (status === "loading" || !session?.user?.email) return

      try {
        // Récupérer les revenus et les abonnements
        const [incomes, subscriptions] = await Promise.all([
          getIncomes(),
          getSubscriptions(),
        ])

        // Créer un tableau des 12 derniers mois
        const now = new Date()
        const twelveMonthsAgo = subMonths(now, 11)
        const months = eachMonthOfInterval({
          start: startOfMonth(twelveMonthsAgo),
          end: endOfMonth(now),
        })

        // Calculer le bilan pour chaque mois
        const balances = months.map((month) => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(month)

          // Calculer les revenus du mois
          const monthlyIncomes = incomes
            .filter((income) => {
              const incomeDate = new Date(income.transferDate)
              return incomeDate >= monthStart && incomeDate <= monthEnd
            })
            .reduce((sum, income) => sum + income.amount, 0)

          // Calculer les dépenses du mois (abonnements)
          const monthlyExpenses = subscriptions
            .filter((sub) => {
              const renewalDate = new Date(sub.renewalDate)
              return renewalDate >= monthStart && renewalDate <= monthEnd
            })
            .reduce((sum, sub) => sum + sub.amount, 0)

          return {
            month: format(month, "MMMM yyyy", { locale: fr }),
            incomes: monthlyIncomes,
            expenses: monthlyExpenses,
            balance: monthlyIncomes - monthlyExpenses,
          }
        })

        setMonthlyBalances(balances)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        toast.error("Erreur lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    loadBalanceData()
  }, [session, status])

  if (status === "loading") {
    return <div>Chargement de la session...</div>
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-center text-gray-600">Veuillez vous connecter pour accéder à votre bilan.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div>Chargement des données...</div>
  }

  // Calculer les totaux
  const totalIncomes = monthlyBalances.reduce((sum, month) => sum + month.incomes, 0)
  const totalExpenses = monthlyBalances.reduce((sum, month) => sum + month.expenses, 0)
  const totalBalance = totalIncomes - totalExpenses

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bilan mensuel</h1>
        <Button variant="outline" className="gap-1">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{totalIncomes.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{totalExpenses.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalBalance.toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Évolution mensuelle</CardTitle>
          <CardDescription>Revenus et dépenses sur les 12 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyBalances}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="incomes" name="Revenus" fill="#22c55e" />
                <Bar dataKey="expenses" name="Dépenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Détail mensuel</CardTitle>
          <CardDescription>Bilan détaillé par mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Mois</th>
                  <th className="text-right py-2">Revenus</th>
                  <th className="text-right py-2">Dépenses</th>
                  <th className="text-right py-2">Solde</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBalances.map((month) => (
                  <tr key={month.month} className="border-b">
                    <td className="py-2">{month.month}</td>
                    <td className="text-right text-green-500">{month.incomes.toFixed(2)} €</td>
                    <td className="text-right text-red-500">{month.expenses.toFixed(2)} €</td>
                    <td className={`text-right ${month.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {month.balance.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
} 