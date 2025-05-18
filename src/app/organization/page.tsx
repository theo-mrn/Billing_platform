"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getOrganization, getOrganizations, updateMemberRole, updateOrganization, createOrganization } from "@/app/actions/organizations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { hasPermission, getAssignableRoles, ROLE_DESCRIPTIONS, type OrganizationRole, canManageRole } from "@/lib/permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvitationLinks } from "@/components/organization/InvitationLinks";
import { OrganizationSelector } from "@/components/ui/OrganizationSelector";

interface Organization {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: OrganizationRole;
}

interface OrganizationDetails extends Omit<Organization, 'role'> {
  users: {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
    role: OrganizationRole;
  }[];
  invitations: {
    id: string;
    email: string | null;
    status: string;
    role: string;
    inviteUrl?: string;
  }[];
  role: OrganizationRole;
}

interface Invitation {
  id: string;
  email: string | null;
  role: string;
  status: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  invitedBy: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  inviteUrl?: string;
}

interface CustomSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function OrganizationPage() {
  const { data: session, status } = useSession() as { data: CustomSession | null, status: string };
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgDetails, setSelectedOrgDetails] = useState<OrganizationDetails | null>(null);
  const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.email) {
        try {
          const orgs = await getOrganizations();
          setOrganizations(orgs);

          // Récupérer les détails de l'organisation sélectionnée
          if (orgs[selectedOrgIndex]?.id) {
            const orgDetails = await getOrganization(orgs[selectedOrgIndex].id);
            setSelectedOrgDetails(orgDetails);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Erreur lors de la récupération des données");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [session, selectedOrgIndex]);

  const handleEdit = () => {
    if (selectedOrgDetails) {
      setEditForm({
        name: selectedOrgDetails.name,
        description: selectedOrgDetails.description || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (selectedOrgDetails) {
      try {
        const updatedOrg = await updateOrganization(selectedOrgDetails.id, editForm);
        setSelectedOrgDetails({
          ...updatedOrg,
          role: selectedOrgDetails.role,
        });
        setIsEditing(false);
        toast.success("Organisation mise à jour avec succès");
      } catch (error) {
        console.error("Error updating organization:", error);
        toast.error("Erreur lors de la mise à jour de l'organisation");
      }
    }
  };

  const handleInvite = async () => {
    if (selectedOrgDetails && inviteEmail) {
      try {
        const response = await fetch(`/api/organizations/${selectedOrgDetails.id}/invitations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: inviteEmail }),
        });

        if (response.ok) {
          const invitation = await response.json();
          setInvitations([...invitations, invitation]);
          setInviteEmail("");
          setIsInviteDialogOpen(false);
          toast.success("Invitation envoyée avec succès");
        } else {
          const error = await response.json();
          toast.error(error.error || "Erreur lors de l'envoi de l'invitation");
        }
      } catch (error) {
        console.error("Error sending invitation:", error);
        toast.error("Erreur lors de l'envoi de l'invitation");
      }
    }
  };



  const handleCreateOrganization = async () => {
    try {
      const newOrg = await createOrganization(createForm);
      const orgs = await getOrganizations();
      setOrganizations(orgs);
      setSelectedOrgIndex(orgs.findIndex(org => org.id === newOrg.id));
      setCreateForm({ name: "", description: "" });
      setIsCreateDialogOpen(false);
      setRefreshTrigger(prev => prev + 1);
      toast.success("Organisation créée avec succès");
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Erreur lors de la création de l&apos;organisation");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Veuillez vous connecter pour voir les informations de votre organisation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organisations</h1>
        <div className="flex items-center gap-4">
          {organizations.length > 0 && <OrganizationSelector refreshTrigger={refreshTrigger} />}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle organisation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle organisation</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle organisation pour collaborer avec votre équipe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Nom de l&apos;organisation</Label>
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Mon organisation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Input
                    id="create-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Description de l&apos;organisation"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleCreateOrganization}
                    disabled={!createForm.name}
                  >
                    Créer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Créez votre première organisation en cliquant sur le bouton &apos;Nouvelle organisation&apos; ci-dessus.
            </p>
          </CardContent>
        </Card>
      ) : !selectedOrgDetails ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Sélectionnez une organisation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Description de l'organisation */}
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l&apos;organisation</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedOrgDetails.name}</h2>
                      <p className="text-muted-foreground mt-1">
                        {selectedOrgDetails.description || "Aucune description"}
                      </p>
                    </div>
                    {selectedOrgDetails.users.some(
                      (userOrg) =>
                        userOrg.user.email === session?.user?.email && userOrg.role === "OWNER"
                    ) && (
                      <Button onClick={handleEdit} variant="outline">
                        Modifier
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Informations supplémentaires */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Créée le{" "}
                  {format(new Date(selectedOrgDetails.createdAt), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </div>
              </div>

              {/* Section des membres */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Membres ({selectedOrgDetails.users.length})
                  </h3>
                  {selectedOrgDetails.users.some(
                    (userOrg) =>
                      userOrg.user.email === session?.user?.email && userOrg.role === "OWNER"
                  ) && (
                    <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Inviter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Inviter un membre</DialogTitle>
                          <DialogDescription>
                            Envoyez une invitation par email à un nouveau membre.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="grid flex-1 gap-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="membre@example.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                              />
                            </div>
                            <Button
                              className="mt-8"
                              onClick={handleInvite}
                              disabled={!inviteEmail}
                            >
                              Inviter
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Liste des membres */}
                  <div className="grid gap-4">
                    {selectedOrgDetails.users.map((userOrg) => (
                      <div
                        key={userOrg.user.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {userOrg.user.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={userOrg.user.image}
                                alt={userOrg.user.name || ""}
                                className="aspect-square h-full w-full"
                              />
                            ) : (
                              <AvatarFallback>
                                {userOrg.user.name?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {userOrg.user.name || userOrg.user.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {userOrg.user.email}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {ROLE_DESCRIPTIONS[userOrg.role]}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {userOrg.user.id !== session?.user?.id && 
                            hasPermission(selectedOrgDetails.role, 'canManageRoles') && 
                            canManageRole(selectedOrgDetails.role, userOrg.role) && (
                            <Select
                              defaultValue={userOrg.role}
                              onValueChange={async (newRole: OrganizationRole) => {
                                try {
                                  await updateMemberRole(selectedOrgDetails.id, userOrg.user.id, newRole);
                                  const userIndex = selectedOrgDetails.users.findIndex(u => u.user.id === userOrg.user.id);
                                  selectedOrgDetails.users[userIndex].role = newRole;
                                  setSelectedOrgDetails({ ...selectedOrgDetails });
                                  toast.success("Rôle mis à jour avec succès");
                                } catch (error) {
                                  console.error("Error updating role:", error);
                                  toast.error((error as Error).message || "Erreur lors de la mise à jour du rôle");
                                }
                              }}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getAssignableRoles(selectedOrgDetails.role).map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Section des invitations par lien */}
                  <InvitationLinks 
                    organizationId={selectedOrgDetails.id}
                    onInvitationCreated={(invitation) => {
                      setSelectedOrgDetails({
                        ...selectedOrgDetails,
                        invitations: [...selectedOrgDetails.invitations, invitation],
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 