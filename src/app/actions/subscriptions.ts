"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import type { Session } from "next-auth"

export async function getSubscriptions() {
  const session = (await getServerSession(authOptions)) as Session | null
  if (!session?.user?.email) {
    throw new Error("Non authentifié")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  // Return empty array since Subscription model doesn't exist yet
  return []
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addSubscription(_data: {
  name: string
  category: string
  amount: number
  frequency: string
  renewalDate: Date
  status: string
  logo?: string
  description?: string
}) {
  const session = (await getServerSession(authOptions)) as Session | null
  if (!session?.user?.email) {
    throw new Error("Non authentifié")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  // Return null since Subscription model doesn't exist yet
  return null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateSubscription(_id: string, _data: {
  name?: string
  category?: string
  amount?: number
  frequency?: string
  renewalDate?: Date
  description?: string
}) {
  const session = (await getServerSession(authOptions)) as Session | null
  if (!session?.user?.email) throw new Error("Non authentifié")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  // Return null since Subscription model doesn't exist yet
  return null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function toggleSubscriptionStatus(_id: string) {
  const session = (await getServerSession(authOptions)) as Session | null
  if (!session?.user?.email) throw new Error("Non authentifié")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  // Return null since Subscription model doesn't exist yet
  return null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteSubscription(_id: string) {
  const session = (await getServerSession(authOptions)) as Session | null
  if (!session?.user?.email) {
    throw new Error("Non authentifié")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  // No-op since Subscription model doesn't exist yet
  revalidatePath("/projects/subscriptions")
} 