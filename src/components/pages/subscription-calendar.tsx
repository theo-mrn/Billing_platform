"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { getDashboardStats } from "@/app/actions/stats"
import { format } from "date-fns"

type CalendarSubscription = {
  id: string
  name: string
  amount: number
  renewalDate: Date
}

interface SubscriptionCalendarProps {
  selectedYear?: string
}

export function SubscriptionCalendar({ selectedYear = new Date().getFullYear().toString() }: SubscriptionCalendarProps) {
  const [subscriptions, setSubscriptions] = useState<CalendarSubscription[]>([])
  const [date, setDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    const loadSubscriptions = async () => {
      const stats = await getDashboardStats()
      const renewals = stats.upcomingRenewals.map((renewal) => ({
        id: renewal.id,
        name: renewal.name,
        amount: renewal.amount,
        renewalDate: new Date(renewal.renewalDate)
      }))
      setSubscriptions(renewals)
    }
    loadSubscriptions()
  }, [])

  const getRenewalsForDate = (date: Date) => {
    return subscriptions.filter(
      (sub) =>
        format(sub.renewalDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
        sub.renewalDate.getFullYear().toString() === selectedYear
    )
  }

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      locale={fr}
      modifiers={{
        hasRenewal: (date) => getRenewalsForDate(date).length > 0,
      }}
      modifiersStyles={{
        hasRenewal: {
          fontWeight: "bold",
          textDecoration: "underline",
        },
      }}
      components={{
        DayContent: (props) => {
          const renewals = getRenewalsForDate(props.date)
          return (
            <div className="flex flex-col items-center gap-1">
              <div>{props.date.getDate()}</div>
              {renewals.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {renewals.map((renewal) => (
                    <Badge
                      key={`${renewal.id}-${renewal.renewalDate.toISOString()}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {renewal.name} - {renewal.amount}€
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )
        },
      }}
      className="rounded-md border"
    />
  )
} 