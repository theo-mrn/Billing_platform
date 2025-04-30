"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Réutiliser le type ChartData (il serait idéal de le définir dans un fichier partagé)
type ChartData = {
  month: string;
  amount: number;
  subscriptions: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
};

interface CurrentMonthDetailsProps {
  initialChartData: ChartData[];
}

export function CurrentMonthDetails({ initialChartData }: CurrentMonthDetailsProps) {
  const [showAllCurrentMonth, setShowAllCurrentMonth] = useState(false);
  const currentMonth = new Date();
  const initialSubscriptionsLimit = 6;

  // Trouver les données du mois en cours à partir des données initiales
  const currentMonthData = initialChartData.find(
    (month) => month.month.toLowerCase() === format(currentMonth, "MMMM", { locale: fr }).toLowerCase()
  );

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-base">Détails pour {format(currentMonth, "MMMM yyyy", { locale: fr })}</CardTitle>
          <CardDescription>
            {/* Peut-être ajouter une description si nécessaire */}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {currentMonthData && currentMonthData.subscriptions.length > 0 ? (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center font-semibold text-lg mb-2 pb-2 border-b">
                <span>Total ce mois:</span>
                <span>
                  {currentMonthData.amount.toLocaleString('fr-FR')} €
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                {/* Afficher les premiers éléments */}
                {currentMonthData.subscriptions.slice(0, initialSubscriptionsLimit).map((sub, index) => (
                  <div key={index} className="flex justify-between items-start text-sm border-b pb-1 last:border-b-0">
                    <div className="flex flex-col">
                      <span className="font-medium">{sub.name}</span>
                      <span className="text-xs text-muted-foreground">{sub.category}</span>
                    </div>
                    <span className="font-medium whitespace-nowrap pl-2">
                      {sub.amount.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                ))}
              </div>
              {/* Bouton "Voir tout" si nécessaire */}
              {currentMonthData.subscriptions.length > initialSubscriptionsLimit && (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setShowAllCurrentMonth(true)}>
                  Voir tout ({currentMonthData.subscriptions.length})
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun abonnement trouvé pour ce mois.</p>
          )}
        </CardContent>
      </Card>

      {/* Dialog for all current month subscriptions */}
      <Dialog open={showAllCurrentMonth} onOpenChange={setShowAllCurrentMonth}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Abonnements de {format(currentMonth, "MMMM yyyy", { locale: fr })}</DialogTitle>
            {currentMonthData && (
              <DialogDescription>
                Total: {currentMonthData.amount.toLocaleString('fr-FR')} €
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="mt-4 overflow-y-auto max-h-[calc(80vh-10rem)] pr-2">
            {/* Afficher tous les éléments dans le Dialog */}
            {currentMonthData && currentMonthData.subscriptions.map((sub, index) => (
              <div key={index} className="flex justify-between items-start text-sm border-b py-2 last:border-b-0">
                <div className="flex flex-col">
                  <span className="font-medium">{sub.name}</span>
                  <span className="text-xs text-muted-foreground">{sub.category}</span>
                </div>
                <span className="font-medium whitespace-nowrap pl-2">
                  {sub.amount.toLocaleString('fr-FR')} €
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 