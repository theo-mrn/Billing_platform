import { Card, CardContent } from "./card";
import { Progress } from "./progress";

interface XPDisplayProps {
  xp: number;
  level: number;
}

const XP_PER_LEVEL = 100; // Nombre d'XP nécessaire pour passer au niveau suivant

export function XPDisplay({ xp, level }: XPDisplayProps) {
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">Niveau {level}</p>
              <p className="text-xs text-muted-foreground">
                {xpInCurrentLevel} / {XP_PER_LEVEL} XP
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{level}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
} 