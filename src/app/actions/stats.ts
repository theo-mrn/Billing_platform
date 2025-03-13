"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns"

export async function getDashboardStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Non authentifié")

  const now = new Date()
  const startOfCurrentMonth = startOfMonth(now)
  const endOfCurrentMonth = endOfMonth(now)

  // Récupérer tous les abonnements actifs
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
    orderBy: {
      renewalDate: "asc",
    },
  })

  // Calculer les dépenses mensuelles totales
  const totalMonthlyExpenses = activeSubscriptions.reduce((total, sub) => {
    const monthlyAmount = sub.frequency === "MONTHLY"
      ? sub.amount
      : sub.frequency === "QUARTERLY"
      ? sub.amount / 3
      : sub.frequency === "SEMI_ANNUAL"
      ? sub.amount / 6
      : sub.amount / 12
    return total + monthlyAmount
  }, 0)

  // Trouver la catégorie principale
  const categoryTotals = activeSubscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + sub.amount
    return acc
  }, {} as Record<string, number>)

  const mainCategory = Object.entries(categoryTotals).reduce((max, [category, total]) => {
    return total > (max.total || 0) ? { category, total } : max
  }, { category: "", total: 0 })

  // Tous les abonnements actifs sont considérés comme des renouvellements à venir
  const upcomingRenewals = activeSubscriptions.map(sub => ({
    ...sub,
    renewalDate: new Date(sub.renewalDate)
  }))

  return {
    totalMonthlyExpenses,
    activeSubscriptions: activeSubscriptions.length,
    upcomingRenewals,
    mainCategory,
  }
}

export async function getExpenseChartData() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Non authentifié")

  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const endOfYear = new Date(now.getFullYear(), 11, 31)

  // Récupérer tous les abonnements actifs de l'année
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  })

  // Calculer les dépenses mensuelles
  const monthlyExpenses = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthTotal = subscriptions.reduce((total, sub) => {
      const monthlyAmount = sub.frequency === "MONTHLY"
        ? sub.amount
        : sub.frequency === "QUARTERLY"
        ? sub.amount / 3
        : sub.frequency === "SEMI_ANNUAL"
        ? sub.amount / 6
        : sub.amount / 12
      return total + monthlyAmount
    }, 0)

    return {
      month: new Date(now.getFullYear(), i, 1).toLocaleString("fr-FR", { month: "long" }),
      amount: monthTotal,
    }
  })

  return monthlyExpenses
}

export async function getCategoryStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Non authentifié")

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
  })

  const categoryTotals = subscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + sub.amount
    return acc
  }, {} as Record<string, number>)

  const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / total) * 100,
  }))
}

export async function getTrendAnalysis() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Non authentifié")

  const now = new Date()
  const threeMonthsAgo = subMonths(now, 3)

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
      createdAt: {
        gte: threeMonthsAgo,
      },
    },
  })

  // Calculer les variations de prix
  const priceChanges = subscriptions.map((sub) => {
    const monthlyAmount = sub.frequency === "MONTHLY"
      ? sub.amount
      : sub.frequency === "QUARTERLY"
      ? sub.amount / 3
      : sub.frequency === "SEMI_ANNUAL"
      ? sub.amount / 6
      : sub.amount / 12

    // Simuler une variation de prix (à remplacer par des données réelles)
    const variation = Math.random() * 20 - 10 // -10% à +10%

    return {
      name: sub.name,
      variation: variation.toFixed(1),
      currentAmount: monthlyAmount,
    }
  })

  // Trier par variation
  const increasingPrices = priceChanges
    .filter((change) => parseFloat(change.variation) > 0)
    .sort((a, b) => parseFloat(b.variation) - parseFloat(a.variation))
    .slice(0, 3)

  const decreasingPrices = priceChanges
    .filter((change) => parseFloat(change.variation) < 0)
    .sort((a, b) => parseFloat(a.variation) - parseFloat(b.variation))
    .slice(0, 3)

  return {
    increasingPrices,
    decreasingPrices,
  }
} 