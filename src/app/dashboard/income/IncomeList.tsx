import { getIncomes } from "@/app/actions/incomes"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export async function IncomeList() {
  const incomes = await getIncomes()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Liste des revenus</h2>
        <div className="text-sm text-muted-foreground">
          {incomes.length} revenu{incomes.length > 1 ? "s" : ""}
        </div>
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">Source</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Date de virement</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Montant</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((income) => (
              <tr key={income.id} className="border-b">
                <td className="p-4 align-middle font-medium">{income.source}</td>
                <td className="p-4 align-middle">
                  {format(new Date(income.transferDate), "PPP", { locale: fr })}
                </td>
                <td className="p-4 align-middle">{income.amount.toFixed(2)} €</td>
                <td className="p-4 align-middle">{income.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 