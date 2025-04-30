"use client"

import { useEffect, useState } from "react"
import { Plus, Search, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster } from "@/components/ui/sonner"
import { getSubscriptions, addSubscription, deleteSubscription, updateSubscription, toggleSubscriptionStatus } from "@/app/actions/subscriptions"
import { getIncomes, addIncome, updateIncome, deleteIncome } from "@/app/actions/incomes"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Type pour les abonnements
export type Subscription = {
  id: string
  name: string
  category: string
  renewalDate: Date
  amount: number
  frequency: string
  status: string
  logo?: string | null
  description?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Type pour les revenus
export type Income = {
  id: string
  source: string
  amount: number
  transferDate: Date | string
  description?: string | null
}

export default function FinancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [activeTab, setActiveTab] = useState("subscriptions")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // États pour le formulaire d'ajout d'abonnement
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [frequency, setFrequency] = useState("")
  const [renewalDate, setRenewalDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState("")

  // États pour les revenus
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [newIncomeOpen, setNewIncomeOpen] = useState(false)
  const [newIncomeDate, setNewIncomeDate] = useState<Date>()
  const [newIncomeAmount, setNewIncomeAmount] = useState("")
  const [newIncomeSource, setNewIncomeSource] = useState("")
  const [newIncomeDescription, setNewIncomeDescription] = useState("")

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        const [subsData, incomesData] = await Promise.all([
          getSubscriptions(),
          getIncomes()
        ])
        setSubscriptions(subsData)
        setIncomes(incomesData)
      } catch {
        toast.error("Erreur lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Fonction pour ajouter un nouvel abonnement
  const handleAddSubscription = async () => {
    if (!name || !amount || !category || !frequency || !renewalDate) {
      toast.error("Veuillez remplir tous les champs obligatoires.")
      return
    }

    try {
      const newSubscription = await addSubscription({
        name,
        category,
        amount: parseFloat(amount),
        frequency,
        renewalDate,
        status: "ACTIVE",
        description,
      })

      setSubscriptions((prev) => [...prev, newSubscription])

      // Réinitialiser le formulaire
      setName("")
      setAmount("")
      setCategory("")
      setFrequency("")
      setRenewalDate(undefined)
      setDescription("")

      // Fermer le dialogue
      setOpen(false)

      // Afficher une notification
      toast.success(`L'abonnement ${name} a été ajouté avec succès.`)
    } catch {
      toast.error("Erreur lors de l'ajout de l'abonnement")
    }
  }

  // Fonction pour supprimer un abonnement
  const handleDeleteSubscription = async (id: string) => {
    try {
      await deleteSubscription(id)
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id))
      toast.success("Abonnement supprimé avec succès")
    } catch {
      toast.error("Erreur lors de la suppression de l'abonnement")
    }
  }

  // Fonction pour mettre à jour un abonnement
  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return

    try {
      const updatedSubscription = await updateSubscription(editingSubscription.id, {
        name: editingSubscription.name,
        category: editingSubscription.category,
        amount: editingSubscription.amount,
        frequency: editingSubscription.frequency,
        renewalDate: editingSubscription.renewalDate,
        description: editingSubscription.description || undefined,
      })

      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === updatedSubscription.id ? updatedSubscription : sub))
      )
      setEditingSubscription(null)
      toast.success("Abonnement mis à jour avec succès")
    } catch {
      toast.error("Erreur lors de la mise à jour de l'abonnement")
    }
  }

  // Fonction pour basculer le statut d'un abonnement
  const handleToggleStatus = async (id: string) => {
    try {
      const updatedSubscription = await toggleSubscriptionStatus(id)
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === updatedSubscription.id ? updatedSubscription : sub))
      )
      toast.success(
        `Abonnement ${updatedSubscription.status === "ACTIVE" ? "activé" : "mis en pause"} avec succès`
      )
    } catch {
      toast.error("Erreur lors du changement de statut de l'abonnement")
    }
  }

  // Gestionnaire pour l'ajout d'un revenu
  const handleAddIncome = async () => {
    if (!newIncomeDate || !newIncomeAmount || !newIncomeSource) {
      toast.error("Veuillez remplir tous les champs obligatoires.")
      return
    }

    try {
      const newIncome = await addIncome({
        source: newIncomeSource,
        amount: parseFloat(newIncomeAmount),
        transferDate: newIncomeDate,
        description: newIncomeDescription || undefined,
      })

      setIncomes((prev) => [...prev, newIncome])
      setNewIncomeOpen(false)
      setNewIncomeDate(undefined)
      setNewIncomeAmount("")
      setNewIncomeSource("")
      setNewIncomeDescription("")
      toast.success("Revenu ajouté avec succès")
    } catch {
      toast.error("Erreur lors de l'ajout du revenu")
    }
  }

  // Gestionnaire pour la mise à jour d'un revenu
  const handleUpdateIncome = async () => {
    if (!editingIncome) return

    try {
      const updatedIncome = await updateIncome(editingIncome.id, {
        source: editingIncome.source,
        amount: editingIncome.amount,
        transferDate: new Date(editingIncome.transferDate),
        description: editingIncome.description || undefined,
      })

      setIncomes((prev) =>
        prev.map((income) => (income.id === updatedIncome.id ? updatedIncome : income))
      )
      setEditingIncome(null)
      toast.success("Revenu mis à jour avec succès")
    } catch {
      toast.error("Erreur lors de la mise à jour du revenu")
    }
  }

  // Gestionnaire pour la suppression d'un revenu
  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncome(id)
      setIncomes((prev) => prev.filter((income) => income.id !== id))
      toast.success("Revenu supprimé avec succès")
    } catch {
      toast.error("Erreur lors de la suppression du revenu")
    }
  }

  // Filtrer les abonnements en fonction de la recherche et de la catégorie
  const filteredSubscriptions = subscriptions
    .filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = categoryFilter === "all" || sub.category === categoryFilter

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());

  // Filtrer les revenus en fonction de la recherche
  const filteredIncomes = incomes.filter((income) =>
    format(new Date(income.transferDate), "MMMM yyyy", { locale: fr })
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  // Obtenir les catégories uniques
  const categories = ["all", ...Array.from(new Set(subscriptions.map(sub => sub.category)))]

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-2xl font-bold">Gestion financière</h1>

        {activeTab === "subscriptions" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Nouvel abonnement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel abonnement</DialogTitle>
                <DialogDescription>
                  Renseignez les informations de votre nouvel abonnement ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du service</Label>
                  <Input
                    id="name"
                    placeholder="Netflix, Spotify, etc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="frequency">Fréquence</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Mensuel</SelectItem>
                        <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
                        <SelectItem value="SEMI_ANNUAL">Semestriel</SelectItem>
                        <SelectItem value="ANNUAL">Annuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bancaire">Bancaire</SelectItem>
                        <SelectItem value="Logiciel">Logiciel</SelectItem>
                        <SelectItem value="Streaming">Streaming</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Productivité">Productivité</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="renewal-date">Date de renouvellement</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="renewal-date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !renewalDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {renewalDate ? format(renewalDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={renewalDate}
                          onSelect={setRenewalDate}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Input
                    id="description"
                    placeholder="Ajouter une description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSubscription}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {activeTab === "incomes" && (
          <Dialog open={newIncomeOpen} onOpenChange={setNewIncomeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Nouveau revenu
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau revenu</DialogTitle>
                <DialogDescription>
                  Renseignez les informations du revenu.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Source du revenu</Label>
                  <Input
                    placeholder="Salaire, Freelance, etc."
                    value={newIncomeSource}
                    onChange={(e) => setNewIncomeSource(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date de réception</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newIncomeDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newIncomeDate ? format(newIncomeDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newIncomeDate}
                        onSelect={setNewIncomeDate}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Montant</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={newIncomeAmount}
                      onChange={(e) => setNewIncomeAmount(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">€</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (optionnel)</Label>
                  <Input
                    placeholder="Ajouter une description..."
                    value={newIncomeDescription}
                    onChange={(e) => setNewIncomeDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddIncome}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="incomes">Revenus</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 w-full">
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Rechercher ${activeTab === "subscriptions" ? "un abonnement" : "un revenu"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {activeTab === "subscriptions" && (
          <div className="mt-4">
            {/* Desktop: Tabs */}
            <div className="hidden md:block">
              <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
                <TabsList>
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category === "all" ? "Tous" : category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Mobile: Select */}
            <div className="md:hidden">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Toutes les catégories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <Card className="mt-4 w-full p-0 sm:p-6">
          <CardHeader className="p-2 sm:p-6">
            <CardTitle className="text-base sm:text-xl">
              {activeTab === "subscriptions" ? "Liste des abonnements" : "Liste des revenus"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {activeTab === "subscriptions" 
                ? "Gérez vos abonnements et leurs renouvellements."
                : "Gérez vos revenus mensuels."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {activeTab === "subscriptions" ? (
              <div className="w-full">
                <Table className="w-full text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%] sm:w-auto px-2 sm:px-4">Service</TableHead>
                      <TableHead className="hidden sm:table-cell">Catégorie</TableHead>
                      <TableHead className="w-[25%] sm:w-auto px-2 sm:px-4">Montant</TableHead>
                      <TableHead className="hidden sm:table-cell">Fréquence</TableHead>
                      <TableHead className="hidden sm:table-cell">Prochain renouvellement</TableHead>
                      <TableHead className="hidden sm:table-cell">Statut</TableHead>
                      <TableHead className="w-[25%] sm:w-[100px] text-right px-2 sm:px-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-medium px-2 sm:px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                              <AvatarImage src={subscription.logo || undefined} alt={subscription.name} />
                              <AvatarFallback>{subscription.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
                              <span className="truncate">{subscription.name}</span>
                              <Badge
                                className="sm:hidden w-fit mt-1"
                                variant={
                                  subscription.status === "ACTIVE"
                                    ? "default"
                                    : subscription.status === "CANCELLED"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {subscription.status === "ACTIVE"
                                  ? "Actif"
                                  : subscription.status === "CANCELLED"
                                  ? "Annulé"
                                  : "En pause"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{subscription.category}</TableCell>
                        <TableCell className="text-right sm:text-left px-2 sm:px-4">{subscription.amount.toFixed(2)} €</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {subscription.frequency === "MONTHLY"
                            ? "Mensuel"
                            : subscription.frequency === "QUARTERLY"
                            ? "Trimestriel"
                            : subscription.frequency === "SEMI_ANNUAL"
                            ? "Semestriel"
                            : "Annuel"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {format(new Date(subscription.renewalDate), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant={
                              subscription.status === "ACTIVE"
                                ? "default"
                                : subscription.status === "CANCELLED"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {subscription.status === "ACTIVE"
                              ? "Actif"
                              : subscription.status === "CANCELLED"
                              ? "Annulé"
                              : "En pause"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right p-0 sm:p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir le menu</span>
                                <SlidersHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingSubscription(subscription)}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(subscription.id)}>
                                {subscription.status === "ACTIVE" ? "Mettre en pause" : "Activer"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteSubscription(subscription.id)}
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
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-2 sm:px-4">Source</TableHead>
                      <TableHead className="px-2 sm:px-4">Date</TableHead>
                      <TableHead className="px-2 sm:px-4">Montant</TableHead>
                      <TableHead className="hidden sm:table-cell">Description</TableHead>
                      <TableHead className="text-right px-2 sm:px-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium px-2 sm:px-4">{income.source}</TableCell>
                        <TableCell className="px-2 sm:px-4">
                          {format(new Date(income.transferDate), "dd/MM/yy", { locale: fr })}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4">{income.amount.toFixed(2)} €</TableCell>
                        <TableCell className="hidden sm:table-cell">{income.description || "-"}</TableCell>
                        <TableCell className="text-right p-0 sm:p-4">
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de modification d'abonnement */}
      <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;abonnement</DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre abonnement ci-dessous.
            </DialogDescription>
          </DialogHeader>
          {editingSubscription && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom du service</Label>
                <Input
                  id="edit-name"
                  placeholder="Netflix, Spotify, etc."
                  value={editingSubscription.name}
                  onChange={(e) =>
                    setEditingSubscription({ ...editingSubscription, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Montant</Label>
                  <div className="relative">
                    <Input
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={editingSubscription.amount}
                      onChange={(e) =>
                        setEditingSubscription({
                          ...editingSubscription,
                          amount: parseFloat(e.target.value),
                        })
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">€</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-frequency">Fréquence</Label>
                  <Select
                    value={editingSubscription.frequency}
                    onValueChange={(value) =>
                      setEditingSubscription({ ...editingSubscription, frequency: value })
                    }
                  >
                    <SelectTrigger id="edit-frequency">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Mensuel</SelectItem>
                      <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
                      <SelectItem value="SEMI_ANNUAL">Semestriel</SelectItem>
                      <SelectItem value="ANNUAL">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Catégorie</Label>
                  <Select
                    value={editingSubscription.category}
                    onValueChange={(value) =>
                      setEditingSubscription({ ...editingSubscription, category: value })
                    }
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Streaming">Streaming</SelectItem>
                      <SelectItem value="Logiciel">Logiciel</SelectItem>
                      <SelectItem value="Stockage">Stockage</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Productivité">Productivité</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-renewal-date">Date de renouvellement</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="edit-renewal-date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingSubscription.renewalDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingSubscription.renewalDate ? (
                          format(new Date(editingSubscription.renewalDate), "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(editingSubscription.renewalDate)}
                        onSelect={(date) =>
                          setEditingSubscription({
                            ...editingSubscription,
                            renewalDate: date || new Date(),
                          })
                        }
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (optionnel)</Label>
                <Input
                  id="edit-description"
                  placeholder="Ajouter une description..."
                  value={editingSubscription.description || ""}
                  onChange={(e) =>
                    setEditingSubscription({
                      ...editingSubscription,
                      description: e.target.value || undefined,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateSubscription}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de modification de revenu */}
      <Dialog open={!!editingIncome} onOpenChange={(open) => !open && setEditingIncome(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le revenu</DialogTitle>
            <DialogDescription>
              Modifiez les informations du revenu.
            </DialogDescription>
          </DialogHeader>
          {editingIncome && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Source du revenu</Label>
                <Input
                  placeholder="Salaire, Freelance, etc."
                  value={editingIncome.source}
                  onChange={(e) =>
                    setEditingIncome({
                      ...editingIncome,
                      source: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Date de réception</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editingIncome.transferDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingIncome.transferDate ? (
                        format(new Date(editingIncome.transferDate), "PPP", { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(editingIncome.transferDate)}
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
                <Label>Montant</Label>
                <div className="relative">
                  <Input
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
                <Label>Description (optionnel)</Label>
                <Input
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

