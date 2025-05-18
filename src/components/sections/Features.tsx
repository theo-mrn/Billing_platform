import { Edit3, Brain, Trello, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { forwardRef } from "react";

const Feature = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} className="w-full py-10 lg:py-20">
      <div className="container mx-auto">
        <div className="flex gap-4 py-20 lg:py-40 flex-col items-start">
          <div>
            <Badge>Suite d&apos;outils</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular">
              Tous vos outils de productivité en un seul endroit
            </h2>
            <p className="text-lg max-w-xl lg:max-w-xl leading-relaxed tracking-tight text-muted-foreground">
              Une suite complète d&apos;outils pour optimiser votre travail et votre apprentissage.
            </p>
          </div>
          <div className="flex gap-10 pt-12 flex-col w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-row gap-6 w-full items-start">
                <Edit3 className="w-6 h-6 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Éditeur de texte</p>
                  <p className="text-muted-foreground text-sm">
                    Un éditeur puissant avec formatage Markdown et organisation par dossiers.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Brain className="w-6 h-6 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Flashcards</p>
                  <p className="text-muted-foreground text-sm">
                    Créez et révisez vos flashcards avec un système de répétition espacée.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 w-full items-start">
                <Trello className="w-6 h-6 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Kanban intuitif</p>
                  <p className="text-muted-foreground text-sm">
                    Organisez vos projets avec des tableaux kanban personnalisables.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Timer className="w-6 h-6 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Pomodoro focus</p>
                  <p className="text-muted-foreground text-sm">
                    Restez concentré avec la technique Pomodoro et des statistiques détaillées.
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
