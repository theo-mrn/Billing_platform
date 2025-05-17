"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { subMonths } from "date-fns"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { fr } from "date-fns/locale"
import { Session } from "next-auth"
import { Income, User, Subscription } from "@prisma/client"

interface CustomSession extends Session {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

interface MonthlyStats {
  month: string;
  totalAmount: number;
  count: number;
}

interface IncomeStats {
  totalAmount: number;
  averageAmount: number;
  monthlyStats: MonthlyStats[];
}

interface UserWithIncomes extends User {
  incomes: Income[];
}

interface UserWithSubscriptions extends User {
  subscriptions: Subscription[];
}

type ChartData = {
  month: string;
  amount: number;
  subscriptions: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
}

export async function getDashboardStats(): Promise<IncomeStats> {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession | null;
    if (!session?.user?.email) {
      throw new Error("Non authentifié");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        incomes: true,
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const userWithIncomes = user as UserWithIncomes;

    // Calculer les statistiques pour les revenus
    const monthlyStats: MonthlyStats[] = [];
    const now = new Date();

    // Calculer les statistiques pour les 12 derniers mois
    for (let i = 0; i < 12; i++) {
      const currentMonth = subMonths(now, i);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const monthlyIncomes = userWithIncomes.incomes.filter((income) => {
        const incomeDate = new Date(income.transferDate);
        return incomeDate >= start && incomeDate <= end;
      });

      const totalAmount = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0);

      monthlyStats.push({
        month: format(currentMonth, "MMM yyyy", { locale: fr }),
        totalAmount,
        count: monthlyIncomes.length,
      });
    }

    // Calculer les statistiques globales
    const totalAmount = userWithIncomes.incomes.reduce((sum, income) => sum + income.amount, 0);
    const averageAmount = userWithIncomes.incomes.length > 0 ? totalAmount / userWithIncomes.incomes.length : 0;

    return {
      totalAmount,
      averageAmount,
      monthlyStats: monthlyStats.reverse(), // Du plus ancien au plus récent
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw new Error("Impossible de récupérer les statistiques");
  }
}

export async function getIncomeStats() {
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

  const now = new Date()
  const sixMonthsAgo = subMonths(now, 6)

  const incomes = await prisma.income.findMany({
    where: {
      userId: user.id,
      transferDate: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      transferDate: "asc",
    },
  })

  const monthlyIncomes = incomes.reduce((acc: { [key: string]: number }, income) => {
    const monthKey = format(income.transferDate, "MMMM yyyy", { locale: fr })
    acc[monthKey] = (acc[monthKey] || 0) + income.amount
    return acc
  }, {})

  const monthlyData = Object.entries(monthlyIncomes).map(([month, amount]) => ({
    month,
    amount,
  }))

  return monthlyData
}

export async function getExpenseChartData(year: number = new Date().getFullYear()): Promise<ChartData[]> {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        where: {
          status: "ACTIVE",
        },
      },
    },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const userWithSubscriptions = user as UserWithSubscriptions;
  const monthlyData: ChartData[] = [];

  for (let month = 0; month < 12; month++) {
    const date = new Date(year, month, 1);
    const monthSubscriptions = userWithSubscriptions.subscriptions.filter(sub => {
      const renewalDate = new Date(sub.renewalDate);
      return renewalDate.getMonth() === month && renewalDate.getFullYear() === year;
    });

    const monthlyAmount = monthSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    monthlyData.push({
      month: format(date, "MMM yyyy", { locale: fr }),
      amount: monthlyAmount,
      subscriptions: monthSubscriptions.map(sub => ({
        name: sub.name,
        amount: sub.amount,
        category: sub.category,
      })),
    });
  }

  return monthlyData;
} 