"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UpcomingRenewals } from "@/components/pages/upcoming-renewals"; // Assuming this component exists

export function UpcomingRenewalsSection() {
  const [showAllRenewals, setShowAllRenewals] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Prochains renouvellements</CardTitle>
            <CardDescription>Abonnements à renouveler prochainement</CardDescription>
          </div>
          {/* Button to open the dialog */}
          <Button variant="outline" onClick={() => setShowAllRenewals(true)}>
            Voir plus
          </Button>
        </CardHeader>
        <CardContent>
          {/* Display limited renewals. Pass props if needed */}
          <UpcomingRenewals limit={3} />
        </CardContent>
      </Card>

      {/* Dialog for all renewals */}
      <Dialog open={showAllRenewals} onOpenChange={setShowAllRenewals}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Tous les prochains renouvellements</DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
            {/* Display all renewals. limit={0} means show all */}
            <UpcomingRenewals limit={0} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 