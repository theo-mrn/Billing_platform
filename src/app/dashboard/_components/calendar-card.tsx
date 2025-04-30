"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getDashboardStats } from "@/app/actions/stats"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, setDate, startOfWeek, endOfWeek } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Subscription = {
  id: string
  name: string
  category: string
  renewalDate: Date
  amount: number
  frequency: string
  status: string
  logo?: string | null
  description?: string | null
}

type Income = {
  id: string
  transferDate: Date
  amount: number
  source: string
  description: string | null
}

type DayEvents = {
  subscriptions: Subscription[]
  incomes: Income[]
}

const WEEKDAYS = [
  { key: "monday", label: "L" },
  { key: "tuesday", label: "M" },
  { key: "wednesday", label: "M" },
  { key: "thursday", label: "J" },
  { key: "friday", label: "V" },
  { key: "saturday", label: "S" },
  { key: "sunday", label: "D" },
]

export function CalendarCard() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<Record<string, DayEvents>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const stats = await getDashboardStats()
        
        // Créer un objet pour stocker les événements par jour
        const eventsByDay: Record<string, DayEvents> = {}

        // Ajouter les abonnements
        stats.upcomingRenewals.forEach(sub => {
          const dateKey = format(sub.renewalDate, "yyyy-MM-dd")
          if (!eventsByDay[dateKey]) {
            eventsByDay[dateKey] = { subscriptions: [], incomes: [] }
          }
          eventsByDay[dateKey].subscriptions.push(sub)
        })

        // Ajouter les revenus mensuels
        stats.monthlyIncomes.forEach((income: Income) => {
          const incomeDate = new Date(income.transferDate)
          const dayOfMonth = incomeDate.getDate()
          const currentMonthDate = setDate(currentDate, dayOfMonth)
          const dateKey = format(currentMonthDate, "yyyy-MM-dd")

          if (!eventsByDay[dateKey]) {
            eventsByDay[dateKey] = { subscriptions: [], incomes: [] }
          }
          eventsByDay[dateKey].incomes.push(income)
        })

        setEvents(eventsByDay)
      } catch (error) {
        console.error("Erreur lors du chargement des événements:", error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [currentDate])

  // Calculer la période complète du calendrier
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Commence le lundi
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }) // Termine le dimanche
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  if (loading) {
    return <Card><CardContent>Chargement du calendrier...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-lg font-medium">
          {format(currentDate, "MMMM yyyy", { locale: fr })}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-accent rounded-lg"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="p-2 hover:bg-accent rounded-lg"
          >
            •
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-accent rounded-lg"
          >
            →
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day) => (
            <div key={day.key} className="text-center text-muted-foreground text-sm py-2 font-medium">
              {day.label}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd")
            const dayEvents = events[dateKey] || { subscriptions: [], incomes: [] }
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[70px] md:min-h-[100px] border-b border-r border-border p-1 md:p-2",
                  !isCurrentMonth && "opacity-30",
                  isCurrentDay && "bg-accent"
                )}
              >
                {/* Numéro du jour */}
                <div className={cn(
                  "text-sm font-medium p-1",
                  isCurrentDay && "text-accent-foreground"
                )}>
                  {format(day, "d")}
                </div>

                {/* Events */}
                <div className="flex flex-wrap gap-1 p-0.5">
                  {isCurrentMonth && dayEvents.subscriptions.map((sub) => (
                    <TooltipProvider key={sub.id}>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-primary/20 ring-1 ring-primary/30 hover:ring-primary/50 transition-all flex items-center justify-center text-xs md:text-sm font-medium">
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <div className="space-y-1">
                            <div className="font-medium">{sub.name}</div>
                            <div>{sub.amount.toFixed(2)}€</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {isCurrentMonth && dayEvents.incomes.map((income) => (
                    <TooltipProvider key={income.id}>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-green-500/20 ring-1 ring-green-500/30 hover:ring-green-500/50 transition-all flex items-center justify-center text-xs md:text-sm font-medium text-green-500">
                            +
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <div className="space-y-1">
                            <div className="font-medium">{income.source}</div>
                            <div>+{income.amount.toFixed(2)}€</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 