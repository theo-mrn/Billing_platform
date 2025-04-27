"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Reuse or import shared ChartData type
type ChartData = {
  month: string;
  amount: number;
  subscriptions: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
};

interface MonthlyTotalsListProps {
  initialChartData: ChartData[];
}

export function MonthlyTotalsList({ initialChartData }: MonthlyTotalsListProps) {
  // Peut-être ajouter des états pour le tri ou le filtre plus tard

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dépenses par mois</CardTitle>
        <CardDescription>Total des dépenses mensuelles</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Utiliser les données initiales passées en props */}
        <div className="space-y-1 border-l pl-3 max-h-[300px] overflow-y-auto pr-2">
          {initialChartData.map((month) => (
            <div key={month.month} className="flex justify-between items-center text-sm py-1">
              <span className="capitalize text-muted-foreground">{month.month}</span>
              <span className="font-medium">{month.amount.toLocaleString('fr-FR')} €</span>
            </div>
          ))}
        </div>
        {initialChartData.length === 0 && (
             <p className="text-sm text-muted-foreground pt-2">Aucune donnée de dépense disponible.</p>
        )}
      </CardContent>
    </Card>
  );
} 