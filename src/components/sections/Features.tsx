import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { forwardRef } from "react";

const Feature = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} className="w-full py-10 lg:py-20">
      <div className="container mx-auto">
        <div className="flex gap-4 py-20 lg:py-40 flex-col items-start">
          <div>
            <Badge>Gestion d&apos;abonnements</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular">
              Gérez vos abonnements en toute simplicité
            </h2>
            <p className="text-lg max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-muted-foreground">
              Une solution complète pour suivre et optimiser vos dépenses mensuelles.
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-2 items-start lg:grid-cols-3 gap-10">
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Vue d&apos;ensemble claire</p>
                  <p className="text-muted-foreground text-sm">
                    Visualisez tous vos abonnements sur un seul tableau de bord.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Alertes personnalisées</p>
                  <p className="text-muted-foreground text-sm">
                    Recevez des notifications avant chaque renouvellement.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Statistiques détaillées</p>
                  <p className="text-muted-foreground text-sm">
                    Analysez vos dépenses et identifiez les économies possibles.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 w-full items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Import facile</p>
                  <p className="text-muted-foreground text-sm">
                    Importez vos abonnements existants en quelques clics.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Catégorisation intelligente</p>
                  <p className="text-muted-foreground text-sm">
                    Organisez automatiquement vos abonnements par catégorie.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Interface intuitive</p>
                  <p className="text-muted-foreground text-sm">
                    Une expérience utilisateur fluide et agréable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Feature.displayName = "Feature";

export { Feature };
