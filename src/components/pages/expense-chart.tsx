"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getExpenseChartData } from "@/app/actions/stats"

type Subscription = {
  name: string
  amount: number
  category: string
}

type ChartData = {
  month: string
  amount: number
  subscriptions: Subscription[]
}

export function ExpenseChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true)
        const chartData = await getExpenseChartData(parseInt(selectedYear))
        setData(chartData)
      } catch (error) {
        console.error("Erreur lors du chargement des données du graphique:", error)
      } finally {
        setLoading(false)
      }
    }
    loadChartData()
  }, [selectedYear])

  if (loading) {
    return <div>Chargement du graphique...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner une année" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {!data.length ? (
        <div>Aucune donnée disponible pour {selectedYear}</div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0 && payload[0]) {
                    const data = payload[0].payload as ChartData;
                    return (
                      <div className="rounded-lg border bg-background p-6 shadow-sm min-w-[300px]">
                        <div className="space-y-4">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">
                              {data.month}
                            </span>
                            <span className="text-xl font-bold">
                              {data.amount.toFixed(2)}€
                            </span>
                          </div>
                          {data.subscriptions.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-muted-foreground border-b pb-2">
                                Abonnements ({data.subscriptions.length})
                              </div>
                              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                {data.subscriptions.map((sub, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{sub.name}</span>
                                      <span className="text-xs text-muted-foreground">{sub.category}</span>
                                    </div>
                                    <span className="font-medium">{sub.amount.toFixed(2)}€</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
      )}
    </div>
  )
}

