"use client"

import { useRef } from "react"
import { Header } from "@/components/sections/Header"
import { Hero } from "@/components/sections/Hero"
import { Contact } from "@/components/sections/Contact"
import { Footer } from "@/components/sections/Footer"
import { ScrollProgress } from "@/components/magicui/scroll-progress"
import { DotPattern } from "@/components/magicui/dot-pattern"
import BackToTop from "@/components/magicui/back-to-top"
import { cn } from "@/lib/utils"

export default function LocalePage() {
  const homeRef = useRef<HTMLDivElement>(null!)
  const projectsRef = useRef<HTMLDivElement>(null!)
  const contactRef = useRef<HTMLDivElement>(null!)

  const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }



  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollProgress className="top-[69px]" />
      <Header />
      <div ref={homeRef}>
        <Hero handleScroll={handleScroll} refs={{ projectsRef, contactRef }} />
      </div>
      <DotPattern
        width={32} 
        height={32} 
        cx={2} 
        cy={2} 
        cr={1.5} 
        className={cn(
          "absolute inset-0 w-full h-full",
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        )}
      />
 
     
      <div ref={contactRef}>
        <Contact />
      </div>
      <Footer />
      <BackToTop />
    </div>
  )
} 