"use client"

import { Hero } from "@/components/sections/Hero"
import { Pricing } from "@/components/sections/Pricing"
import { useRef } from "react"
import { Footer } from "@/components/sections/Footer"
import BackToTop from "@/components/magicui/back-to-top"
import { Feature } from "@/components/sections/Features";
import { Header } from "@/components/sections/Header";

export default function Home() {
  const featureRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main>
      <Header handleScroll={handleScroll} refs={{ featureRef, pricingRef }} />
      <Hero handleScroll={handleScroll} refs={{ featureRef, contactRef }} />
      <Feature ref={featureRef} />
      <Pricing ref={pricingRef} />
      <Footer />
      <BackToTop />
    </main>
  )
} 