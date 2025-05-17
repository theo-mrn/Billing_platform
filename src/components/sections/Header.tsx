"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState } from 'react'
import { useSession } from "next-auth/react"
import Link from 'next/link'
import ProfileMenu from "@/components/ui/ProfileMenu"
import Image from "next/image"
import { Package, Menu, X } from "lucide-react"

interface HeaderProps {
  variant?: 'default' | 'dashboard'
  handleScroll?: (ref: React.RefObject<HTMLDivElement>) => void
  refs?: {
    featureRef?: React.RefObject<HTMLDivElement>
    pricingRef?: React.RefObject<HTMLDivElement>
  }
}

export function Header({ variant = 'default', handleScroll, refs }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  const navigationItems = [
    { label: "Fonctionnalités", ref: refs?.featureRef },
    { label: "Tarifs", ref: refs?.pricingRef }
  ]

  const handleMobileMenuClick = (ref?: React.RefObject<HTMLDivElement>) => {
    if (ref) {
      setIsMobileMenuOpen(false)
      setTimeout(() => {
        handleScroll?.(ref)
      }, 100)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {variant === 'default' && (
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}
          
          {variant === 'dashboard' ? (
            <Link href="/projects" className="flex items-center gap-2 text-lg font-semibold">
              <Package className="h-6 w-6" />
              <span>FacturePro</span>
            </Link>
          ) : (
            <h1 className="text-xl font-bold">Yner Cloud</h1>
          )}
        </div>
        
        {variant === 'default' && (
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.ref && handleScroll?.(item.ref)}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <div className="relative">
            {session ? (
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-900"
              >
                <Image
                  alt="User"
                  src={session?.user?.image || "/placeholder.svg"}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </button>
            ) : (
              <div className="flex gap-2 ml-auto">
                <Link href="/register">
                  <Button variant="outline">
                    S&apos;inscrire
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="default">
                    Se connecter
                  </Button>
                </Link>
              </div>
            )}
            <AnimatePresence>
              {isProfileOpen && session && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-72"
                >
                  <ProfileMenu />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-b"
          >
            <nav className="container mx-auto px-6 py-4 flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleMobileMenuClick(item.ref)}
                  className="text-sm font-medium hover:text-primary transition-colors text-left"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
} 