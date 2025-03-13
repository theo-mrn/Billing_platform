"use client"

import { useEffect, useState } from "react"
import { Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react"
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

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  // États pour le formulaire d'ajout d'abonnement
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [frequency, setFrequency] = useState("")
  const [renewalDate, setRenewalDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState("")

  // Charger les abonnements au montage du composant
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const data = await getSubscriptions()
        setSubscriptions(data)
      } catch {
        toast.error("Erreur lors du chargement des abonnements")
      } finally {
        setLoading(false)
      }
    }
    loadSubscriptions()
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
        description: editingSubscription.description,
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

  // Filtrer les abonnements en fonction de la recherche
  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des abonnements</h1>

        {/* Dialogue d'ajout d'abonnement */}
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
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un abonnement..."
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
            <CardTitle>Liste des abonnements</CardTitle>
            <CardDescription>Gérez vos abonnements et leurs renouvellements.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Prochain renouvellement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={subscription.logo || undefined} alt={subscription.name} />
                          <AvatarFallback>{subscription.name[0]}</AvatarFallback>
                        </Avatar>
                        {subscription.name}
                      </div>
                    </TableCell>
                    <TableCell>{subscription.category}</TableCell>
                    <TableCell>{subscription.amount.toFixed(2)} €</TableCell>
                    <TableCell>
                      {subscription.frequency === "MONTHLY"
                        ? "Mensuel"
                        : subscription.frequency === "QUARTERLY"
                        ? "Trimestriel"
                        : subscription.frequency === "SEMI_ANNUAL"
                        ? "Semestriel"
                        : "Annuel"}
                    </TableCell>
                    <TableCell>{format(new Date(subscription.renewalDate), "dd/MM/yyyy", { locale: fr })}</TableCell>
                    <TableCell>
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
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de modification d'abonnement */}
      <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifier l'abonnement</DialogTitle>
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
    </>
  )
}

