import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import { getIncomes } from "@/app/actions/incomes"
import { getSubscriptions } from "@/app/actions/subscriptions"
import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { BalancePageClientContent } from './_components/balance-page-client-content'

type MonthlyBalance = {
  month: string
  incomes: number
  expenses: number
  balance: number
}

export default async function BalancePage() {
  let monthlyBalances: MonthlyBalance[] = []
  let errorMessage: string | null = null

  try {
    const [incomes, subscriptions] = await Promise.all([
      getIncomes(),
      getSubscriptions(),
    ])

    const now = new Date()
    const twelveMonthsAgo = subMonths(now, 11)
    const months = eachMonthOfInterval({
      start: startOfMonth(twelveMonthsAgo),
      end: endOfMonth(now),
    })

    monthlyBalances = months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const monthlyIncomes = incomes
        .filter((income) => {
          const incomeDate = new Date(income.transferDate)
          return incomeDate >= monthStart && incomeDate <= monthEnd
        })
        .reduce((sum, income) => sum + income.amount, 0)

      const monthlyExpenses = subscriptions
        .filter((sub) => {
          const renewalDate = new Date(sub.renewalDate)
          return renewalDate >= monthStart && renewalDate <= monthEnd
        })
        .reduce((sum, sub) => sum + sub.amount, 0)

      return {
        month: format(month, "MMMM yyyy", { locale: fr }),
        incomes: monthlyIncomes,
        expenses: monthlyExpenses,
        balance: monthlyIncomes - monthlyExpenses,
      }
    })

  } catch (error) {
    console.error("Erreur lors du chargement des données côté serveur:", error)
    errorMessage = "Erreur lors du chargement des données du bilan."
  }

  return (
    <Suspense fallback={<BalancePageSkeleton />}>
      <BalancePageClientContent 
        initialBalances={monthlyBalances} 
        errorLoading={errorMessage} 
      />
    </Suspense>
  )
}

function BalancePageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-3 mt-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-[450px] w-full mt-4" />
      <Skeleton className="h-[300px] w-full mt-4" />
    </div>
  )
} 