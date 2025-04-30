"use client"

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { toast, Toaster } from "sonner";
import { MonthlyExpensesChartCard } from "@/app/dashboard/_components/monthly-expenses-chart-card";
// Potentially reuse the action if filtering/re-fetching is needed client-side
// import { getSubscriptions } from "@/app/actions/subscriptions";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"]; // Added more colors

type ChartData = {
  month: string;
  amount: number;
  subscriptions: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
};

// Reuse or import shared type
type CategoryData = {
  category: string;
  amount: number;
  percentage: number;
};

interface ReportsPageClientContentProps {
  initialCategoryData: CategoryData[];
  errorLoading: string | null;
  expenseChartData: ChartData[];
}

export function ReportsPageClientContent({ 
  initialCategoryData, 
  errorLoading,
  expenseChartData 
}: ReportsPageClientContentProps) {
  const [period, setPeriod] = useState("month"); // Default period
  const [categoryData, setCategoryData] = useState<CategoryData[]>(initialCategoryData);
  // Add state for date range picker if needed
  // const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (errorLoading) {
      toast.error(errorLoading);
    }
  }, [errorLoading]);

  // This useEffect would run if we needed to re-fetch or recalculate data on period change
  useEffect(() => {
    // If period changes, you might want to:
    // 1. Re-fetch data using getSubscriptions with period filters (if API supports it)
    // 2. OR, if initialCategoryData contains *all* subscriptions, filter it here based on period
    // For now, we'll just log the period change and use the initial data
    console.log("Period changed to:", period);
    // setCategoryData(recalculateDataBasedOnPeriod(initialCategoryData, period)); // Example
    // For simplicity, we currently just use the initial data passed from server
    setCategoryData(initialCategoryData); 

    if (period === 'custom') {
       toast.info("Sélection de période personnalisée non implémentée.");
       // Here you would typically open a Date Range Picker
    }

  }, [period, initialCategoryData]);

  // Placeholder for export
  const handleExport = () => {
    toast.info("Fonctionnalité d'exportation non implémentée.");
  };

  // Display error message if loading failed server-side
  if (errorLoading && initialCategoryData.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-500">{errorLoading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rapports et analyses</h1>
        <Button variant="outline" className="gap-1" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-end gap-2 mb-4">
          {/* Period Selector */}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Dernier mois</SelectItem>
              <SelectItem value="quarter">Dernier trimestre</SelectItem>
              <SelectItem value="year">Dernière année</SelectItem>
              {/* <SelectItem value="custom">Période personnalisée</SelectItem> */}
            </SelectContent>
          </Select>
          {/* Calendar Button (for custom period - currently disabled logic) */}
          {/* 
          <Button 
            variant="outline" 
            size="icon" 
            disabled={period !== 'custom'} 
            onClick={() => {/* Open Date Picker * /}}
          >
            <Calendar className="h-4 w-4" />
            <span className="sr-only">Sélectionner une date</span>
          </Button> 
          */}
        </div>
        
        {categoryData.length === 0 && !errorLoading ? (
            <Card className="mt-4">
              <CardContent className="pt-6">
                 <p className="text-center text-muted-foreground">Aucune donnée de catégorie à afficher pour la période sélectionnée.</p>
              </CardContent>
            </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pie Chart Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par catégorie</CardTitle>
                  <CardDescription>
                    Distribution des dépenses pour la période sélectionnée
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="percentage" // Use percentage for the pie size
                        nameKey="category"
                        cx="50%"
                        cy="45%" // Adjust vertical position slightly
                        innerRadius={60}
                        outerRadius={100}
                        startAngle={90}
                        endAngle={450}
                        paddingAngle={2}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 1.3; // Adjust label distance
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return percent > 0.02 ? ( // Show label for slices > 2%
                            <text
                              x={x}
                              y={y}
                              fill="currentColor"
                              textAnchor={x > cx ? 'start' : 'end'}
                              dominantBaseline="central"
                              className="text-xs fill-muted-foreground"
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          ) : null;
                        }}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke="hsl(var(--card))" // Use card background for stroke
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Legend
                        layout="horizontal" 
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }} // Add padding to legend
                        iconSize={10}
                        content={({ payload }) => (
                          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4">
                            {payload?.map((entry, index) => (
                              <div key={`item-${index}`} className="flex items-center gap-1.5">
                                <div
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {entry.value} {/* Category name */}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsla(var(--muted), 0.2)' }} // Lighter tooltip background
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as CategoryData;
                            return (
                              <div className="rounded-lg border bg-background p-2.5 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: payload[0].color }}
                                  />
                                  <span className="font-medium text-sm">{data.category}</span>
                                </div>
                                <div className="mt-1.5 text-right">
                                  <span className="font-bold">
                                    {data.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({data.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 self-start">
                {categoryData.sort((a,b) => b.amount - a.amount).map((category, index) => (
                  <Card key={category.category}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                      <CardTitle className="text-sm font-medium truncate">{category.category}</CardTitle>
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <div className="text-xl font-bold">
                        {category.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.percentage.toFixed(1)}% des dépenses
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Monthly Expenses Chart */}
            <MonthlyExpensesChartCard chartData={expenseChartData} />
          </div>
        )}
      </div>
    </div>
  );
} 