"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import type { Session } from "next-auth"

export async function getIncomes() {
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

  return prisma.income.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      transferDate: "desc",
    },
  })
}

export async function addIncome(data: {
  source: string
  amount: number
  description?: string
  transferDate: Date
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

  const income = await prisma.income.create({
    data: {
      ...data,
      userId: user.id,
    },
  })

  revalidatePath("/projects/incomes")
  return income
}

export async function updateIncome(id: string, data: {
  source?: string
  amount?: number
  description?: string
  transferDate?: Date
}) {
  const session = (await getServerSession(authOptions)) as Session | null
  if (!session?.user?.email) throw new Error("Non authentifié")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  const income = await prisma.income.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!income || income.userId !== user.id) {
    throw new Error("Revenu non trouvé ou non autorisé")
  }

  return prisma.income.update({
    where: { id },
    data,
  })
}

export async function deleteIncome(id: string) {
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

  await prisma.income.delete({
    where: {
      id,
      userId: user.id,
    },
  })

  revalidatePath("/projects/incomes")
} 