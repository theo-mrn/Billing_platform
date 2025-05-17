"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"

export async function getIncomes() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.error("Non authentifié")
      throw new Error("Non authentifié")
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      console.error("Utilisateur non trouvé")
      throw new Error("Utilisateur non trouvé")
    }

    console.log("Récupération des revenus pour l'utilisateur:", user.id)
    const incomes = await prisma.income.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        transferDate: "desc",
      },
    })
    console.log("Revenus trouvés:", incomes.length)
    return incomes
  } catch (error) {
    console.error("Erreur détaillée lors de la récupération des revenus:", error)
    throw new Error("Impossible de récupérer les revenus")
  }
}

export async function addIncome(data: {
  source: string
  amount: number
  transferDate: Date
  description?: string
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.error("Non authentifié")
      throw new Error("Non authentifié")
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      console.error("Utilisateur non trouvé")
      throw new Error("Utilisateur non trouvé")
    }

    console.log("Ajout d'un revenu pour l'utilisateur:", user.id)
    console.log("Données du revenu:", {
      ...data,
      transferDate: data.transferDate.toISOString(),
    })

    const income = await prisma.income.create({
      data: {
        ...data,
        userId: user.id,
        transferDate: new Date(data.transferDate),
      },
    })
    console.log("Revenu créé avec succès:", income)
    revalidatePath("/projects/income")
    return income
  } catch (error) {
    console.error("Erreur détaillée lors de l'ajout du revenu:", error)
    throw new Error("Impossible d'ajouter le revenu")
  }
}

export async function updateIncome(id: string, data: {
  source: string
  amount: number
  transferDate: Date
  description?: string
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.error("Non authentifié")
      throw new Error("Non authentifié")
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      console.error("Utilisateur non trouvé")
      throw new Error("Utilisateur non trouvé")
    }

    const income = await prisma.income.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!income || income.userId !== user.id) {
      console.error("Revenu non trouvé ou non autorisé")
      throw new Error("Revenu non trouvé ou non autorisé")
    }

    console.log("Mise à jour du revenu:", id)
    console.log("Nouvelles données:", {
      ...data,
      transferDate: data.transferDate.toISOString(),
    })

    const updatedIncome = await prisma.income.update({
      where: { id },
      data: {
        ...data,
        transferDate: new Date(data.transferDate),
      },
    })
    console.log("Revenu mis à jour avec succès:", updatedIncome)
    revalidatePath("/projects/income")
    return updatedIncome
  } catch (error) {
    console.error("Erreur détaillée lors de la mise à jour du revenu:", error)
    throw new Error("Impossible de mettre à jour le revenu")
  }
}

export async function deleteIncome(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.error("Non authentifié")
      throw new Error("Non authentifié")
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      console.error("Utilisateur non trouvé")
      throw new Error("Utilisateur non trouvé")
    }

    console.log("Suppression du revenu:", id)
    await prisma.income.delete({
      where: {
        id,
        userId: user.id,
      },
    })
    console.log("Revenu supprimé avec succès")
    revalidatePath("/projects/income")
  } catch (error) {
    console.error("Erreur détaillée lors de la suppression du revenu:", error)
    throw new Error("Impossible de supprimer le revenu")
  }
} 