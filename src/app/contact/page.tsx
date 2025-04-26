"use client"
import { Contact } from "@/components/sections/Contact"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col  w-full min-h-screen">
      <Contact />
      <div className="mt-16 flex justify-center items-center">
        <Button asChild className="bg-secondary text-white hover:bg-secondary/80">
          <Link href="/">
            retour à la page d&apos;accueil
            <ArrowRight
        className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
        size={16}
        strokeWidth={2}
        aria-hidden="true"
      />
          </Link>
        </Button>
      </div>
    </div>

  )
}