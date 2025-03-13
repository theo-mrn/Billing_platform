export type Subscription = {
  id: string
  name: string
  category: string
  amount: number
  frequency: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL"
  renewalDate: Date
  status: "ACTIVE" | "CANCELLED" | "PAUSED"
  logo?: string | null
  description?: string | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

export type DashboardStats = {
  totalMonthlyExpenses: number
  activeSubscriptions: number
  upcomingRenewals: Subscription[]
  mainCategory: {
    category: string
    total: number
  }
}

export type ExpenseChartData = {
  month: string
  amount: number
} 