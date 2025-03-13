"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, CreditCard, Download, FileText, PieChart, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, Cell } from "recharts"
import { getExpenseChartData, getCategoryStats, getTrendAnalysis } from "@/app/actions/stats"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

type ExpenseChartData = {
  month: string
  amount: number
}

type CategoryData = {
  category: string
  amount: number
  percentage: number
}

type TrendData = {
  increasingPrices: Array<{ name: string; variation: string; currentAmount: number }>
  decreasingPrices: Array<{ name: string; variation: string; currentAmount: number }>
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("month")
  const [expenseData, setExpenseData] = useState<ExpenseChartData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [trendData, setTrendData] = useState<TrendData>({ increasingPrices: [], decreasingPrices: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expenses, categories, trends] = await Promise.all([
          getExpenseChartData(),
          getCategoryStats(),
          getTrendAnalysis(),
        ])
        setExpenseData(expenses)
        setCategoryData(categories)
        setTrendData(trends)
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

  const totalExpenses = expenseData.reduce((sum, data) => sum + data.amount, 0)
  const averageMonthlyExpense = totalExpenses / expenseData.length
  const yearlyForecast = averageMonthlyExpense * 12

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="h-6 w-6" />
            <span>FacturePro</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-medium">
              Tableau de bord
            </Link>
            <Link href="/dashboard/reports" className="text-sm font-medium underline">
              Rapports
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Rapports et analyses</h1>
            <Button variant="outline" className="gap-1">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Tabs defaultValue="expenses" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="expenses">Dépenses</TabsTrigger>
                <TabsTrigger value="categories">Catégories</TabsTrigger>
                <TabsTrigger value="trends">Tendances</TabsTrigger>
              </TabsList>
              <div className="flex items-center justify-end gap-2 mt-4">
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
              <TabsContent value="expenses" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des dépenses</CardTitle>
                    <CardDescription>
                      Visualisez l&apos;évolution de vos dépenses d&apos;abonnement au fil du temps
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expenseData}>
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
                              const data = payload[0].payload as ExpenseChartData
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        {data.month}
                                      </span>
                                      <span className="font-bold text-muted-foreground">
                                        {data.amount.toFixed(2)}€
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
                  </CardContent>
                </Card>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total des dépenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} €</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500 inline-flex items-center">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          +5.2%
                        </span>{" "}
                        par rapport à la période précédente
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Dépense moyenne mensuelle</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{averageMonthlyExpense.toFixed(2)} €</div>
                      <p className="text-xs text-muted-foreground mt-1">Basé sur les {expenseData.length} derniers mois</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Prévision annuelle</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{yearlyForecast.toFixed(2)} €</div>
                      <p className="text-xs text-muted-foreground mt-1">Basé sur les dépenses actuelles</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="categories" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par catégorie</CardTitle>
                    <CardDescription>
                      Analysez la distribution de vos dépenses par catégorie d&apos;abonnement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload as CategoryData
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        {data.category}
                                      </span>
                                      <span className="font-bold text-muted-foreground">
                                        {data.amount.toFixed(2)}€
                                      </span>
                                    </div>
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              </TabsContent>
              <TabsContent value="trends" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analyse des tendances</CardTitle>
                    <CardDescription>
                      Identifiez les tendances et évolutions de vos dépenses d&apos;abonnement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Abonnements en hausse</CardTitle>
                          <CardDescription>Services dont le coût a augmenté récemment</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {trendData.increasingPrices.map((item) => (
                              <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span>{item.name}</span>
                                </div>
                                <div className="text-red-500">+{item.variation}%</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Recommandations d&apos;optimisation</CardTitle>
                          <CardDescription>Suggestions pour réduire vos coûts d&apos;abonnement</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {trendData.decreasingPrices.map((item) => (
                              <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span>{item.name}</span>
                                </div>
                                <div className="text-green-500">{item.variation}%</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

