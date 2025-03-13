"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BackToTopProps {
  threshold?: number
  className?: string
  smooth?: boolean
}

export default function BackToTop({ threshold = 300, className, smooth = true }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    // Set initial visibility
    handleScroll()

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold])

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } else {
      window.scrollTo(0, 0)
    }
  }

  return (
    <motion.button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 hover:bg-white/10",
        className,
      )}
      initial={{ opacity: 0, y: 100 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 100,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{
        opacity: { duration: 0.2 },
        y: { duration: 0.3, type: "spring" },
        scale: { duration: 0.2 },
      }}
      aria-label="Retour en haut de la page"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left side of chevron */}
        <motion.path
          d="M12 9L6 15"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            d: isHovered ? "M6 10L12 4" : "M12 9L6 15",
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
        />

        {/* Right side of chevron */}
        <motion.path
          d="M12 9L18 15"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            d: isHovered ? "M18 10L12 4" : "M12 9L18 15",
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
        />

        {/* Arrow stem that appears */}
        <motion.path
          d="M12 9L12 9"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{
            d: isHovered ? "M12 4L12 20" : "M12 9L12 9",
            pathLength: isHovered ? 1 : 0,
          }}
          transition={{
            d: { duration: 0.25, ease: "easeOut" },
            pathLength: { duration: 0.25, delay: 0.1 },
          }}
        />
      </svg>
    </motion.button>
  )
} 