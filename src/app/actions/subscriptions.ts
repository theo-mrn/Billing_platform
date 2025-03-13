"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"

export async function getSubscriptions() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Non authentifié")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      renewalDate: "asc",
    },
  })

  return subscriptions
}

export async function addSubscription(data: {
  name: string
  category: string
  amount: number
  frequency: string
  renewalDate: Date
  status: string
  logo?: string
  description?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Non authentifié")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  const subscription = await prisma.subscription.create({
    data: {
      ...data,
      userId: user.id,
    },
  })

  revalidatePath("/dashboard/subscriptions")
  return subscription
}

export async function updateSubscription(id: string, data: {
  name?: string
  category?: string
  amount?: number
  frequency?: string
  renewalDate?: Date
  description?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Non authentifié")

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!subscription || subscription.userId !== session.user.id) {
    throw new Error("Abonnement non trouvé ou non autorisé")
  }

  return prisma.subscription.update({
    where: { id },
    data,
  })
}

export async function toggleSubscriptionStatus(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Non authentifié")

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    select: { userId: true, status: true },
  })

  if (!subscription || subscription.userId !== session.user.id) {
    throw new Error("Abonnement non trouvé ou non autorisé")
  }

  return prisma.subscription.update({
    where: { id },
    data: {
      status: subscription.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
    },
  })
}

export async function deleteSubscription(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Non authentifié")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  await prisma.subscription.delete({
    where: {
      id,
      userId: user.id,
    },
  })

  revalidatePath("/dashboard/subscriptions")
} 