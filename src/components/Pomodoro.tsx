"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { createPomodoroSession } from "@/app/_actions/pomodoro";
import { toast } from "sonner";

export default function Pomodoro({ mini = true }: { mini?: boolean }) {
  const { data: session } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(60);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [workDuration, setWorkDuration] = useState(1);
  const [breakDuration, setBreakDuration] = useState(1);
  const [isBreakReady, setIsBreakReady] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSessionEnd = useCallback(async () => {
    if (!session?.user?.email || !sessionStartTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000);

    try {
      await createPomodoroSession({
        startTime: sessionStartTime,
        endTime,
        duration,
        type: isWorkTime ? 'WORK' : 'BREAK',
      });
    } catch (error) {
      console.error('Failed to save pomodoro session:', error);
      toast.error('Failed to save session');
    }
  }, [session?.user?.email, sessionStartTime, isWorkTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isWorkTime) {
      handleSessionEnd();
      setIsActive(false);
      setIsBreakReady(true);
    } else if (time === 0 && !isWorkTime) {
      handleSessionEnd();
      setIsActive(false);
      setIsWorkTime(true);
      setTime(workDuration * 60);
    }

    return () => clearInterval(interval);
  }, [isActive, time, isWorkTime, workDuration, handleSessionEnd]);

  const toggleTimer = () => {
    if (!isActive) {
      setSessionStartTime(new Date());
    } else {
      handleSessionEnd();
    }
    setIsActive(!isActive);
  };

  const startBreak = () => {
    setSessionStartTime(new Date());
    setIsWorkTime(false);
    setTime(breakDuration * 60);
    setIsBreakReady(false);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (mini && !isExpanded) {
    return (
      <Card className="bg-background border-border shadow-none">
        <CardContent className="p-1 flex items-center gap-1 justify-between">
          <div className="flex items-center gap-1">
            <Coffee className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-mono font-semibold">
              {formatTime(time)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {isWorkTime ? "Work" : "Break"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant={isActive ? "destructive" : "ghost"}
              className="h-7 w-7 p-0"
              onClick={toggleTimer}
              disabled={time === 0 && isWorkTime}
            >
              {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setIsExpanded(true)}
              aria-label="Ouvrir le Pomodoro"
            >
              <span className="sr-only">Ouvrir</span>
              <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted border-border shadow-none">
      <CardContent className="p-1 pb-0">
        <div className="flex justify-between items-center mb-0">
          <span className="text-xs font-semibold text-muted-foreground">Pomodoros</span>
          {mini && (
            <Button size="icon" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsExpanded(false)} aria-label="Réduire">
              <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </Button>
          )}
        </div>
        <motion.div 
          className="text-center mb-1"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-xl font-bold font-mono">
            {formatTime(time)}
          </div>
          <motion.div 
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isWorkTime ? "Work Time" : "Break Time"}
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isActive && !isBreakReady && (
            <motion.div 
              className="space-y-2 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex items-center justify-between rounded-md bg-muted/50 p-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="text-sm text-muted-foreground">Work sprint</span>
                <Select
                  value={workDuration.toString()}
                  onValueChange={(value) => {
                    setWorkDuration(Number(value));
                    if (isWorkTime) setTime(Number(value) * 60);
                  }}
                >
                  <SelectTrigger className="h-7 w-[100px] flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <SelectValue />
                      <span className="text-muted-foreground text-xs">min</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 30, 45, 60, 90].map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div 
                className="flex items-center justify-between rounded-md bg-muted/50 p-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="text-sm text-muted-foreground">Break</span>
                <Select
                  value={breakDuration.toString()}
                  onValueChange={(value) => {
                    setBreakDuration(Number(value));
                    if (!isWorkTime) setTime(Number(value) * 60);
                  }}
                >
                  <SelectTrigger className="h-7 w-[100px] flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <SelectValue />
                      <span className="text-muted-foreground text-xs">min</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 5, 10, 15, 20].map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isBreakReady ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                className="w-full flex items-center justify-center gap-1 h-7 text-xs" 
                onClick={startBreak}
                variant="default"
              >
                <Coffee className="h-3 w-3" /> Start Break
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                className="w-full flex items-center justify-center gap-1 h-7 text-xs" 
                onClick={toggleTimer}
                variant={isActive ? "destructive" : "default"}
                disabled={time === 0 && isWorkTime}
              >
                {isActive ? (
                  <>
                    <Pause className="h-3 w-3" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" /> Start
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
} 