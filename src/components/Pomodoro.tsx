"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Pomodoro() {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(60);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [workDuration, setWorkDuration] = useState(1);
  const [breakDuration, setBreakDuration] = useState(1);
  const [isBreakReady, setIsBreakReady] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isWorkTime) {
      setIsActive(false);
      setIsBreakReady(true);
    } else if (time === 0 && !isWorkTime) {
      setIsActive(false);
      setIsWorkTime(true);
      setTime(workDuration * 60);
    }

    return () => clearInterval(interval);
  }, [isActive, time, isWorkTime, workDuration]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const startBreak = () => {
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

  return (
    <Card className="bg-background border-border">
      <CardContent className="p-3">
        <motion.div 
          className="mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm font-medium">Pomodoros</span>
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

        <motion.div 
          className="text-center mb-3"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-3xl font-bold font-mono">
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
          {isBreakReady ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                className="w-full flex items-center justify-center gap-2" 
                onClick={startBreak}
                variant="default"
              >
                <Coffee className="h-4 w-4" /> Start Break
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
                className="w-full flex items-center justify-center gap-2" 
                onClick={toggleTimer}
                variant={isActive ? "destructive" : "default"}
                disabled={time === 0 && isWorkTime}
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Start
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