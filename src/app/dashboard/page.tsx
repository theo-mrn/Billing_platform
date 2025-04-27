import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DashboardStats } from "@/components/pages/dashboard-stats"
import { CurrentMonthDetails } from './_components/current-month-details'
import { MonthlyExpensesChartCard } from './_components/monthly-expenses-chart-card'
import { UpcomingRenewalsSection } from './_components/upcoming-renewals-section'
import { MonthlyTotalsList } from './_components/monthly-totals-list'
import { PDFDownloadClientButton } from './_components/pdf-download-client-button'
import { getExpenseChartData } from "@/app/actions/stats"
import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"

export default async function DashboardPage() {
  // Fetch data directly on the server
  const chartDataPromise = getExpenseChartData()
  
  // Await the data
  const chartData = await chartDataPromise

  const currentMonth = new Date()

  return (
    <div className="flex flex-col gap-2 sm:gap-4 w-full p-2 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-4">
          <Suspense fallback={<Skeleton className="h-9 w-24" />}>
            <PDFDownloadClientButton initialChartData={chartData} />
          </Suspense>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full sm:flex-row">
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <DashboardStats />
        </Suspense>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr,300px] gap-2 sm:gap-4">
        <Suspense fallback={<Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-[400px] w-full" /></CardContent></Card>}>
          <MonthlyExpensesChartCard initialChartData={chartData} />
        </Suspense>

        <Suspense fallback={<Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[300px] w-full" /></CardContent></Card>}>
          <CurrentMonthDetails initialChartData={chartData} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <Suspense fallback={<Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-[150px] w-full" /></CardContent></Card>}>
          <UpcomingRenewalsSection />
        </Suspense>

        <Suspense fallback={<Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[150px] w-full" /></CardContent></Card>}>
          <MonthlyTotalsList initialChartData={chartData} />
        </Suspense>
      </div>
    </div>
  )
}

