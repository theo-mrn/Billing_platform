"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseChart } from "@/components/pages/expense-chart"; // Assuming this component exists and works client-side

// Removed unused type definition
// type ChartData = { ... };

// Removed props interface
// interface MonthlyExpensesChartCardProps { ... }

// Removed props from function signature
export function MonthlyExpensesChartCard() {
  // Pass the initialChartData to the ExpenseChart component if needed
  // Or ExpenseChart might fetch its own data based on props/context

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dépenses mensuelles</CardTitle>
        <CardDescription>Évolution de vos dépenses d&apos;abonnement sur les 12 derniers mois</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        {/* Pass data to ExpenseChart if it accepts it */}
        <ExpenseChart /* chartData={initialChartData} */ />
      </CardContent>
    </Card>
  );
} 