import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DashboardStats } from "@/components/pages/dashboard-stats"
import { CurrentMonthDetails } from './_components/current-month-details'
import { MonthlyTotalsList } from './_components/monthly-totals-list'
import { PDFDownloadClientButton } from './_components/pdf-download-client-button'
import { getExpenseChartData } from "@/app/actions/stats"
import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarCard } from './_components/calendar-card'

export default async function DashboardPage() {
  // Fetch data directly on the server
  const chartDataPromise = getExpenseChartData()
  
  // Await the data
  const chartData = await chartDataPromise

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

      <div className="w-full">
        <Suspense fallback={<Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[400px] w-full" /></CardContent></Card>}>
          <CalendarCard />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <Suspense fallback={<Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[400px] w-full" /></CardContent></Card>}>
          <div className="h-full min-h-[400px]">
            <CurrentMonthDetails initialChartData={chartData} />
          </div>
        </Suspense>

        <Suspense fallback={<Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[400px] w-full" /></CardContent></Card>}>
          <div className="h-full min-h-[400px]">
            <MonthlyTotalsList initialChartData={chartData} />
          </div>
        </Suspense>
      </div>
    </div>
  )
}

