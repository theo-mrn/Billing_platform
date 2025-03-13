"use client";

import { AnimatePresence } from "framer-motion";

interface ClientAnimationWrapperProps {
  children: React.ReactNode;
}

export function ClientAnimationWrapper({ children }: ClientAnimationWrapperProps) {
  return (
    <AnimatePresence mode="wait" initial={true}>
      {children}
    </AnimatePresence>
  );
} 