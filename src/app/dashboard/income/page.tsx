"use client"

import { useEffect, useState } from "react"
import { Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getIncomes, addIncome, updateIncome, deleteIncome } from "@/app/actions/incomes"

type MonthlyIncome = {
  id: string
  transferDate: Date
  amount: number
  source: string
  description: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export default function IncomePage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [monthlyIncomes, setMonthlyIncomes] = useState<MonthlyIncome[]>([])
  const [editingIncome, setEditingIncome] = useState<MonthlyIncome | null>(null)
  const [loading, setLoading] = useState(true)

  // États pour le formulaire d'ajout de revenu
  const [transferDate, setTransferDate] = useState<Date | undefined>(undefined)
  const [amount, setAmount] = useState("")
  const [source, setSource] = useState("")
  const [description, setDescription] = useState<string | null>(null)

  // Charger les revenus au montage du composant
  useEffect(() => {
    const loadIncomes = async () => {
      console.log("État de la session:", status)
      console.log("Données de la session:", session)

      if (status === "loading") {
        console.log("Chargement de la session...")
        return
      }

      if (!session?.user?.email) {
        console.log("Pas de session utilisateur")
        return
      }

      try {
        console.log("Tentative de chargement des revenus...")
        const data = await getIncomes()
        console.log("Revenus chargés avec succès:", data)
        setMonthlyIncomes(data)
      } catch (err) {
        console.error("Erreur détaillée lors du chargement des revenus:", err)
        toast.error("Erreur lors du chargement des revenus")
      } finally {
        setLoading(false)
      }
    }
    loadIncomes()
  }, [session, status])

  // Fonction pour ajouter un nouveau revenu
  const handleAddIncome = async () => {
    if (!session?.user?.email) {
      console.log("Pas de session utilisateur pour l'ajout")
      toast.error("Vous devez être connecté pour ajouter un revenu")
      return
    }

    if (!transferDate || !amount || !source) {
      toast.error("Veuillez remplir tous les champs obligatoires.")
      return
    }

    try {
      console.log("Tentative d'ajout d'un revenu...")
      const newIncome = await addIncome({
        source,
        amount: parseFloat(amount),
        transferDate,
        description: description || undefined,
      })
      console.log("Revenu ajouté avec succès:", newIncome)

      setMonthlyIncomes((prev) => [...prev, newIncome])

      // Réinitialiser le formulaire
      setTransferDate(undefined)
      setAmount("")
      setSource("")
      setDescription(null)

      // Fermer le dialogue
      setOpen(false)

      // Afficher une notification
      toast.success(`Le revenu a été ajouté avec succès.`)
    } catch (err) {
      console.error("Erreur détaillée lors de l'ajout du revenu:", err)
      toast.error("Erreur lors de l'ajout du revenu")
    }
  }

  // Fonction pour supprimer un revenu
  const handleDeleteIncome = async (id: string) => {
    if (!session?.user?.email) {
      console.log("Pas de session utilisateur pour la suppression")
      toast.error("Vous devez être connecté pour supprimer un revenu")
      return
    }

    try {
      console.log("Tentative de suppression du revenu:", id)
      await deleteIncome(id)
      console.log("Revenu supprimé avec succès")
      setMonthlyIncomes((prev) => prev.filter((income) => income.id !== id))
      toast.success("Revenu supprimé avec succès")
    } catch (err) {
      console.error("Erreur détaillée lors de la suppression du revenu:", err)
      toast.error("Erreur lors de la suppression du revenu")
    }
  }

  // Fonction pour mettre à jour un revenu
  const handleUpdateIncome = async () => {
    if (!session?.user?.email) {
      console.log("Pas de session utilisateur pour la mise à jour")
      toast.error("Vous devez être connecté pour modifier un revenu")
      return
    }

    if (!editingIncome) return

    try {
      console.log("Tentative de mise à jour du revenu:", editingIncome.id)
      const updatedIncome = await updateIncome(editingIncome.id, {
        source: editingIncome.source,
        amount: editingIncome.amount,
        transferDate: editingIncome.transferDate,
        description: editingIncome.description || undefined,
      })
      console.log("Revenu mis à jour avec succès:", updatedIncome)
      setMonthlyIncomes((prev) =>
        prev.map((income) => (income.id === updatedIncome.id ? updatedIncome : income))
      )
      setEditingIncome(null)
      toast.success("Revenu mis à jour avec succès")
    } catch (err) {
      console.error("Erreur détaillée lors de la mise à jour du revenu:", err)
      toast.error("Erreur lors de la mise à jour du revenu")
    }
  }

  // Filtrer les revenus en fonction de la recherche
  const filteredIncomes = monthlyIncomes.filter(
    (income) =>
      income.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalIncome = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0)

  if (status === "loading") {
    return <div>Chargement de la session...</div>
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-center text-gray-600">Veuillez vous connecter pour accéder à vos revenus.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div>Chargement des revenus...</div>
  }

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des revenus</h1>

        {/* Dialogue d'ajout de revenu */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Nouveau revenu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau revenu</DialogTitle>
              <DialogDescription>
                Renseignez les informations de votre nouveau revenu ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source du revenu</Label>
                <Input
                  id="source"
                  placeholder="Salaire, Freelance, etc."
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Date de virement</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !transferDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {transferDate ? format(transferDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={transferDate}
                      onSelect={setTransferDate}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">€</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input
                  id="description"
                  placeholder="Ajouter une description..."
                  value={description || ""}
                  onChange={(e) => setDescription(e.target.value || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddIncome}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un revenu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Liste des revenus</CardTitle>
            <CardDescription>Gérez vos revenus mensuels.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Date de virement</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium">{income.source}</TableCell>
                    <TableCell>{format(new Date(income.transferDate), "PPP", { locale: fr })}</TableCell>
                    <TableCell>{income.amount.toFixed(2)} €</TableCell>
                    <TableCell>{income.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <SlidersHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditingIncome(income)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteIncome(income.id)}
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total des revenus</span>
                <span className="text-green-500 font-bold text-lg">{totalIncome.toFixed(2)} €</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de modification de revenu */}
      <Dialog open={!!editingIncome} onOpenChange={(open) => !open && setEditingIncome(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifier le revenu</DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre revenu ci-dessous.
            </DialogDescription>
          </DialogHeader>
          {editingIncome && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-source">Source du revenu</Label>
                <Input
                  id="edit-source"
                  placeholder="Salaire, Freelance, etc."
                  value={editingIncome.source}
                  onChange={(e) =>
                    setEditingIncome({ ...editingIncome, source: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Date de virement</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editingIncome.transferDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingIncome.transferDate ? format(editingIncome.transferDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editingIncome.transferDate}
                      onSelect={(date) =>
                        setEditingIncome({
                          ...editingIncome,
                          transferDate: date || new Date(),
                        })
                      }
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">Montant</Label>
                <div className="relative">
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={editingIncome.amount}
                    onChange={(e) =>
                      setEditingIncome({
                        ...editingIncome,
                        amount: parseFloat(e.target.value),
                      })
                    }
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">€</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (optionnel)</Label>
                <Input
                  id="edit-description"
                  placeholder="Ajouter une description..."
                  value={editingIncome.description || ""}
                  onChange={(e) =>
                    setEditingIncome({
                      ...editingIncome,
                      description: e.target.value || null,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateIncome}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 