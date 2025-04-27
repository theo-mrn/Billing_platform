import { getSubscriptions } from "@/app/actions/subscriptions"
import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { ReportsPageClientContent } from './_components/reports-page-client-content'

type CategoryData = {
  category: string
  amount: number
  percentage: number
}

export default async function ReportsPage() {
  let initialCategoryData: CategoryData[] = []
  let errorMessage: string | null = null

  try {
    const subscriptions = await getSubscriptions()

    const categoryTotals = subscriptions.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + sub.amount
      return acc
    }, {} as Record<string, number>)

    const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
    
    if (totalAmount > 0) {
      initialCategoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalAmount) * 100
      }))
    } else {
      initialCategoryData = Object.keys(categoryTotals).map(category => ({
        category,
        amount: 0,
        percentage: 0
      }))
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données côté serveur:", error)
    errorMessage = "Erreur lors du chargement des données des rapports."
  }

  return (
    <Suspense fallback={<ReportsPageSkeleton />}>
      <ReportsPageClientContent 
        initialCategoryData={initialCategoryData} 
        errorLoading={errorMessage} 
      />
    </Suspense>
  )
}

function ReportsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  )
}

