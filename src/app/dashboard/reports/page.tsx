"use client"

import { useEffect, useState } from "react"
import { Calendar, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts"
import { getSubscriptions } from "@/app/actions/subscriptions"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

type CategoryData = {
  category: string
  amount: number
  percentage: number
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("month")
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const subscriptions = await getSubscriptions()
        
        // Calculer les statistiques par catégorie
        const categoryTotals = subscriptions.reduce((acc, sub) => {
          acc[sub.category] = (acc[sub.category] || 0) + sub.amount
          return acc
        }, {} as Record<string, number>)

        const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
        const categoryStats = Object.entries(categoryTotals).map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalAmount) * 100
        }))

        setCategoryData(categoryStats)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [period])

  if (loading) {
    return <div>Chargement des rapports...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rapports et analyses</h1>
        <Button variant="outline" className="gap-1">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full">
          <div className="flex items-center justify-end gap-2 mb-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Dernier mois</SelectItem>
                <SelectItem value="quarter">Dernier trimestre</SelectItem>
                <SelectItem value="year">Dernière année</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
              <span className="sr-only">Sélectionner une date</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégorie</CardTitle>
                <CardDescription>
                  Analysez la distribution de vos dépenses par catégorie d&apos;abonnement
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="percentage"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      startAngle={90}
                      endAngle={450}
                      paddingAngle={2}
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return percent > 0.01 ? (
                          <text
                            x={x}
                            y={y}
                            fill="currentColor"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-xs"
                          >
                            {`${(percent * 100).toFixed(1)}%`}
                          </text>
                        ) : null;
                      }}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={80}
                      content={({ payload }) => (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-8">
                          {payload?.map((entry, index) => (
                            <div key={`item-${index}`} className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as CategoryData
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: payload[0].color }}
                                />
                                <span className="font-medium">{data.category}</span>
                              </div>
                              <div className="mt-2">
                                <span className="text-2xl font-bold">
                                  {data.percentage.toFixed(1)}%
                                </span>
                                <span className="text-sm text-muted-foreground ml-1">
                                  des dépenses totales
                                </span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              {categoryData.map((category, index) => (
                <Card key={category.category} className={`bg-${COLORS[index % COLORS.length]}-50 dark:bg-${COLORS[index % COLORS.length]}-950`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{category.amount.toFixed(2)} €</div>
                    <p className="text-xs text-muted-foreground mt-1">{category.percentage.toFixed(1)}% des dépenses totales</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

