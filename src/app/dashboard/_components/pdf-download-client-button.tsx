"use client"

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Reuse or import shared ChartData type
type ChartData = {
  month: string;
  amount: number;
  subscriptions: Array<{
    name: string;
    amount: number;
    category: string;
  }>;
};

// Dynamically import the original button
const PDFDownloadButton = dynamic(
  () => import("@/components/pages/pdf-download-button").then((mod) => mod.PDFDownloadButton),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-9 w-24" /> // Add a loading state
  }
);

interface PDFDownloadClientButtonProps {
  initialChartData: ChartData[];
}

export function PDFDownloadClientButton({ initialChartData }: PDFDownloadClientButtonProps) {
  const currentMonth = new Date();

  // Find current month data for the button prop
  const currentMonthData = initialChartData.find(
    (month) => month.month.toLowerCase() === format(currentMonth, "MMMM", { locale: fr }).toLowerCase()
  );

  return (
    <PDFDownloadButton
      currentMonth={currentMonth}
      // Pass only the subscriptions for the current month, or empty array
      subscriptions={currentMonthData?.subscriptions || []} 
    />
  );
} 