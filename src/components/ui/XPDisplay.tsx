import { Progress } from "./progress";
import { motion, AnimatePresence } from "framer-motion";
import { useXP } from "@/hooks/useXP";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function XPDisplay() {
  const { xp, level, isLoading } = useXP();
  const [prevXp, setPrevXp] = useState(xp);
  const [isAnimating, setIsAnimating] = useState(false);

  const XP_PER_LEVEL = 100;
  const xpForCurrentLevel = level * XP_PER_LEVEL;
  const xpForNextLevel = (level + 1) * XP_PER_LEVEL;
  const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  useEffect(() => {
    if (xp !== prevXp) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevXp(xp);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [xp, prevXp]);

  if (isLoading) {
    return (
      <div className="w-full space-y-2 py-1">
        <div className="animate-pulse space-y-2">
          <div className="h-2 bg-muted rounded w-1/4"></div>
          <div className="h-1.5 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Niveau {level}</p>
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center"
              >
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-xs text-muted-foreground">
          {xp} / {xpForNextLevel} XP
        </p>
      </div>
      
      <div className="relative h-1">
        <Progress 
          value={progress} 
          className="h-1 [&>div]:bg-primary/50"
        />
        {isAnimating && (
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-primary opacity-20"
              animate={{
                x: ["0%", "100%"],
              }}
              transition={{
                duration: 1,
                ease: "linear",
                repeat: Infinity,
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
} 