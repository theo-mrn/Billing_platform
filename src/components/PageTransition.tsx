"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: [React.ReactNode, React.ReactNode];
  isImageRight?: boolean;
}

export function PageTransition({ children, isImageRight = false }: PageTransitionProps) {
  const [FormSection, ImageSection] = children;

  const variants = {
    initial: (isRight: boolean) => ({
      x: isRight ? 100 : -100,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: (isRight: boolean) => ({
      x: isRight ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="grid h-screen md:grid-cols-2">
      <motion.div
        custom={!isImageRight}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1,
        }}
        className={cn(
          "relative z-10 flex h-screen",
          isImageRight ? "md:order-1" : "md:order-2"
        )}
      >
        {FormSection}
      </motion.div>

      <motion.div
        custom={isImageRight}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          mass: 1,
          delay: 0.1,
        }}
        className={cn(
          "relative hidden h-screen md:block",
          isImageRight ? "md:order-2" : "md:order-1"
        )}
      >
        {ImageSection}
      </motion.div>
    </div>
  );
} 