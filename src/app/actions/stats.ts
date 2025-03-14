"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {  subMonths } from "date-fns"

export async function getDashboardStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Non authentifié")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        orderBy: { renewalDate: "asc" },
      },
      incomes: true,
    },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  const activeSubscriptions = user.subscriptions

  // Calculer les dépenses mensuelles totales pour l'année en cours
  const currentYear = new Date().getFullYear()
  const monthlyExpenses = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(currentYear, i, 1).toLocaleString("fr-FR", { month: "long" }),
    amount: 0,
    subscriptions: [] as Array<{
      name: string
      amount: number
      category: string
    }>,
  }))

  // Pour chaque abonnement, calculer les dates de renouvellement pour l'année
  activeSubscriptions.forEach(sub => {
    const renewalDate = new Date(sub.renewalDate)
    const startYear = renewalDate.getFullYear()
    const startMonth = renewalDate.getMonth()

    // Calculer les mois de renouvellement selon la fréquence
    let renewalMonths: number[] = []
    
    switch (sub.frequency) {
      case "MONTHLY":
        renewalMonths = Array.from({ length: 12 }, (_, i) => i)
        break
      
      case "QUARTERLY":
        for (let month = 0; month < 12; month += 3) {
          const adjustedMonth = (startMonth + month) % 12
          renewalMonths.push(adjustedMonth)
        }
        break
      
      case "SEMI_ANNUAL":
        for (let month = 0; month < 12; month += 6) {
          const adjustedMonth = (startMonth + month) % 12
          renewalMonths.push(adjustedMonth)
        }
        break
      
      case "ANNUAL":
        if (currentYear === startYear) {
          renewalMonths = [startMonth]
        }
        break
    }

    // Ajouter le montant aux mois de renouvellement
    renewalMonths.forEach(month => {
      const renewalDateForMonth = new Date(currentYear, month, renewalDate.getDate())
      if (renewalDateForMonth >= renewalDate) {
        monthlyExpenses[month].amount += sub.amount
        monthlyExpenses[month].subscriptions.push({
          name: sub.name,
          amount: sub.amount,
          category: sub.category,
        })
      }
    })
  })

  // Calculer la moyenne mensuelle des dépenses
  const averageMonthlyExpense = monthlyExpenses.reduce((sum, month) => sum + month.amount, 0) / 12

  // Calculer le total annuel des dépenses
  const totalAnnualExpense = monthlyExpenses.reduce((sum, month) => sum + month.amount, 0)

  // Obtenir le mois en cours
  const currentMonth = new Date().getMonth()
  const currentMonthExpense = monthlyExpenses[currentMonth].amount

  // Calculer les revenus
  const currentYearIncomes = user.incomes.filter(income => {
    const transferDate = new Date(income.transferDate)
    return transferDate.getFullYear() === currentYear
  })

  const totalAnnualIncome = currentYearIncomes.reduce((sum, income) => sum + income.amount, 0)
  const averageMonthlyIncome = totalAnnualIncome / 12

  // Calculer le revenu du mois en cours
  const currentMonthIncome = currentYearIncomes
    .filter(income => new Date(income.transferDate).getMonth() === currentMonth)
    .reduce((sum, income) => sum + income.amount, 0)

  // Générer les prochains renouvellements pour le calendrier
  const now = new Date()
  const upcomingRenewals = activeSubscriptions.flatMap(sub => {
    const renewalDate = new Date(sub.renewalDate)
    const nextRenewals: Array<{
      id: string
      name: string
      category: string
      renewalDate: Date
      amount: number
      frequency: string
      status: string
      logo?: string | null
      description?: string | null
    }> = []

    // Calculer les 12 prochaines dates de renouvellement
    let count = 0
    while (count < 12) {
      if (renewalDate > now) {
        nextRenewals.push({
          ...sub,
          renewalDate: new Date(renewalDate),
        })
        count++
      }

      // Avancer à la prochaine date selon la fréquence
      switch (sub.frequency) {
        case "MONTHLY":
          renewalDate.setMonth(renewalDate.getMonth() + 1)
          break
        case "QUARTERLY":
          renewalDate.setMonth(renewalDate.getMonth() + 3)
          break
        case "SEMI_ANNUAL":
          renewalDate.setMonth(renewalDate.getMonth() + 6)
          break
        case "ANNUAL":
          renewalDate.setFullYear(renewalDate.getFullYear() + 1)
          break
      }
    }

    return nextRenewals
  })

  // Trier tous les renouvellements par date
  const sortedRenewals = upcomingRenewals.sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime())

  return {
    averageMonthlyExpense,
    totalAnnualExpense,
    currentMonthExpense,
    averageMonthlyIncome,
    totalAnnualIncome,
    currentMonthIncome,
    activeSubscriptions: activeSubscriptions.length,
    upcomingRenewals: sortedRenewals,
    monthlyIncomes: currentYearIncomes,
  }
}

export async function getExpenseChartData(year: number = new Date().getFullYear()) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Non authentifié")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  // Récupérer tous les abonnements actifs
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
  })

  // Initialiser les dépenses mensuelles à 0 pour chaque mois
  const monthlyExpenses = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i, 1).toLocaleString("fr-FR", { month: "long" }),
    amount: 0,
    subscriptions: [] as Array<{
      name: string
      amount: number
      category: string
    }>,
  }))

  // Pour chaque abonnement, calculer les dates de renouvellement pour l'année
  subscriptions.forEach(sub => {
    const renewalDate = new Date(sub.renewalDate)
    const startYear = renewalDate.getFullYear()
    const startMonth = renewalDate.getMonth()

    // Calculer les mois de renouvellement selon la fréquence
    let renewalMonths: number[] = []
    
    switch (sub.frequency) {
      case "MONTHLY":
        renewalMonths = Array.from({ length: 12 }, (_, i) => i)
        break
      
      case "QUARTERLY":
        for (let month = 0; month < 12; month += 3) {
          const adjustedMonth = (startMonth + month) % 12
          renewalMonths.push(adjustedMonth)
        }
        break
      
      case "SEMI_ANNUAL":
        for (let month = 0; month < 12; month += 6) {
          const adjustedMonth = (startMonth + month) % 12
          renewalMonths.push(adjustedMonth)
        }
        break
      
      case "ANNUAL":
        if (year === startYear) {
          renewalMonths = [startMonth]
        }
        break
    }

    // Ajouter le montant aux mois de renouvellement
    renewalMonths.forEach(month => {
      const renewalDateForMonth = new Date(year, month, renewalDate.getDate())
      if (renewalDateForMonth >= renewalDate) {
        monthlyExpenses[month].amount += sub.amount
        monthlyExpenses[month].subscriptions.push({
          name: sub.name,
          amount: sub.amount,
          category: sub.category,
        })
      }
    })
  })

  return monthlyExpenses
}

export async function getCategoryStats() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Non authentifié")

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session.user.email,
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
  if (!session?.user?.email) throw new Error("Non authentifié")

  const currentDate = new Date()
  const threeMonthsAgo = subMonths(currentDate, 3)

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session.user.email,
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