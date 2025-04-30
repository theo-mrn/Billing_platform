"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseChart } from "@/components/pages/expense-chart";

type ChartData = {
  month: string;
  amount: number;
  subscriptions: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
};

interface MonthlyExpensesChartCardProps {
  chartData?: ChartData[];
}

export function MonthlyExpensesChartCard({ chartData }: MonthlyExpensesChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des dépenses</CardTitle>
        <CardDescription>Évolution de vos dépenses d&apos;abonnement sur les 12 derniers mois</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ExpenseChart initialChartData={chartData} />
      </CardContent>
    </Card>
  );
} 