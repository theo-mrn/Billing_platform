"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import React, { useState } from 'react'
import { useSession } from "next-auth/react"
import Link from 'next/link'
import ProfileMenu from "@/components/ui/ProfileMenu"
import Image from "next/image"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Package } from "lucide-react"

interface HeaderProps {
  variant?: 'default' | 'dashboard'
}

export function Header({ variant = 'default' }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="mx-auto px-6 py-4 flex justify-between items-center">
        {variant === 'dashboard' ? (
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-6 w-6" />
            <span>FacturePro</span>
          </Link>
        ) : (
          <h1 className="text-xl font-bold">Théo MORIN</h1>
        )}
        
        {variant === 'default' && (
          <nav className="flex space-x-8">
            <Link href="/dashboard" className="text-sm font-medium">Dashboard</Link>
            <Link href="/about" className="text-sm font-medium">À propos</Link>
            <Link href="/projects" className="text-sm font-medium">Projets</Link>
            <Link href="/contact" className="text-sm font-medium">Contact</Link>
          </nav>
        )}

        <div className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:hidden"
          >
            <Button variant="ghost" size="icon">
              <span className="sr-only">Menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ModeToggle />
          </motion.div>
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
    </header>
  )
} 