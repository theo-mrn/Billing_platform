"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Toaster } from "@/components/ui/sonner"

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

export default function CalendarPage() {
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
          // Récupérer le jour du mois du revenu
          const incomeDate = new Date(income.transferDate)
          const dayOfMonth = incomeDate.getDate()

          // Créer une date pour le mois en cours avec le même jour
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
    return <div>Chargement du calendrier...</div>
  }

  return (
    <>
      <Toaster />
      <div className="flex flex-col gap-2 sm:gap-4 w-full p-2 sm:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold">Calendrier</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-base rounded-md hover:bg-gray-100"
            >
              Mois précédent
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-base rounded-md hover:bg-gray-100"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-base rounded-md hover:bg-gray-100"
            >
              Mois suivant
            </button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="text-base sm:text-xl">{format(currentDate, "MMMM yyyy", { locale: fr })}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <div key={day.key} className="text-center font-semibold py-1 text-xs sm:py-2 sm:text-sm">
                  {day.label}
                </div>
              ))}
              {days.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd")
                const dayEvents = events[dateKey] || { subscriptions: [], incomes: [] }
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isCurrentDay = isToday(day)

                if (!isCurrentMonth) {
                  return <div key={day.toString()} className="min-h-[60px] sm:min-h-[100px]" />
                }

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border rounded-md",
                      isCurrentDay && "border-2 border-blue-500 bg-blue-50/50"
                    )}
                  >
                    <div className={cn(
                      "font-semibold mb-1 text-xs sm:text-sm",
                      isCurrentDay && "text-blue-600"
                    )}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {isCurrentMonth && (
                        <>
                          {dayEvents.subscriptions.map((sub) => (
                            <TooltipProvider key={sub.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-[10px] sm:text-xs p-0.5 sm:p-1 rounded bg-red-100 text-red-800 truncate">
                                    {sub.name} - {sub.amount.toFixed(2)} €
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <div className="font-medium">{sub.name}</div>
                                    <div>Catégorie: {sub.category}</div>
                                    <div>Montant: {sub.amount.toFixed(2)} €</div>
                                    <div>Fréquence: {
                                      sub.frequency === "MONTHLY" ? "Mensuel" :
                                      sub.frequency === "QUARTERLY" ? "Trimestriel" :
                                      sub.frequency === "SEMI_ANNUAL" ? "Semestriel" :
                                      "Annuel"
                                    }</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          {dayEvents.incomes.map((income) => (
                            <TooltipProvider key={income.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-[10px] sm:text-xs p-0.5 sm:p-1 rounded bg-green-100 text-green-800 truncate">
                                    {income.source} - {income.amount.toFixed(2)} €
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <div className="font-medium">{income.source}</div>
                                    <div>Montant: {income.amount.toFixed(2)} €</div>
                                    {income.description && (
                                      <div>Description: {income.description}</div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 