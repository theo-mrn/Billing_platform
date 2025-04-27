"use client"

import { useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Reuse or import shared type
type MonthlyBalance = {
  month: string;
  incomes: number;
  expenses: number;
  balance: number;
};

interface BalancePageClientContentProps {
  initialBalances: MonthlyBalance[];
  errorLoading: string | null; 
}

export function BalancePageClientContent({ initialBalances, errorLoading }: BalancePageClientContentProps) {

  useEffect(() => {
    // Display error toast if an error occurred during server-side fetching
    if (errorLoading) {
      toast.error(errorLoading);
    }
  }, [errorLoading]);

  // If error, display a message instead of the content
  if (errorLoading && initialBalances.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-500">{errorLoading}</p>
      </div>
    );
  }

  // Calculate totals based on the initial data provided
  const totalIncomes = initialBalances.reduce((sum, month) => sum + month.incomes, 0);
  const totalExpenses = initialBalances.reduce((sum, month) => sum + month.expenses, 0);
  const totalBalance = totalIncomes - totalExpenses;

  // Placeholder for export functionality
  const handleExport = () => {
    toast.info("Fonctionnalité d'exportation non implémentée.");
    // TODO: Implement CSV or PDF export logic here
  };

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bilan mensuel</h1>
        <Button variant="outline" className="gap-1" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Summary Cards */}
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

      {/* Monthly Chart */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Évolution mensuelle</CardTitle>
          <CardDescription>Revenus et dépenses sur les 12 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={initialBalances} // Use pre-fetched data
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

      {/* Monthly Details Table */}
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
                {initialBalances.length > 0 ? (
                  initialBalances.map((month) => (
                    <tr key={month.month} className="border-b">
                      <td className="py-2">{month.month}</td>
                      <td className="text-right text-green-500">{month.incomes.toFixed(2)} €</td>
                      <td className="text-right text-red-500">{month.expenses.toFixed(2)} €</td>
                      <td className={`text-right ${month.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {month.balance.toFixed(2)} €
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted-foreground">
                      Aucune donnée à afficher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 