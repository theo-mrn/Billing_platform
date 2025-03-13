"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getExpenseChartData } from "@/app/actions/stats"

type ChartData = {
  month: string
  amount: number
}

export function ExpenseChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChartData = async () => {
      try {
        const chartData = await getExpenseChartData()
        setData(chartData)
      } catch (error) {
        console.error("Erreur lors du chargement des données du graphique:", error)
      } finally {
        setLoading(false)
      }
    }
    loadChartData()
  }, [])

  if (loading) {
    return <div>Chargement du graphique...</div>
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des dépenses</CardTitle>
          <CardDescription>Aucune donnée disponible</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des dépenses</CardTitle>
        <CardDescription>Visualisez l&apos;évolution de vos dépenses d&apos;abonnement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {payload[0].payload.month}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value.toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="amount"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

