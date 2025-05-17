"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Calendar, Mail, Plus, X, Clock, ChevronDown, Copy } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { updateMemberRole, updateOrganization } from "@/app/actions/organizations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Organization {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.email) {
        try {
          const orgResponse = await fetch(`/api/organizations/user`);
          if (orgResponse.ok) {
            const orgsData = await orgResponse.json();
            setOrganizations(orgsData);

            // Seulement après avoir l'organisation sélectionnée, on récupère les invitations
            if (orgsData[selectedOrgIndex]?.id) {
              const invitationsResponse = await fetch(`/api/organizations/${orgsData[selectedOrgIndex].id}/invitations`);
              if (invitationsResponse.ok) {
                const invitationsData = await invitationsResponse.json();
                setInvitations(invitationsData);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [session, selectedOrgIndex]);

  const handleEdit = () => {
    if (organizations[selectedOrgIndex]) {
      setEditForm({
        name: organizations[selectedOrgIndex].name,
        description: organizations[selectedOrgIndex].description || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (organizations[selectedOrgIndex]) {
      try {
        const updatedOrg = await updateOrganization(organizations[selectedOrgIndex].id, editForm);
        const updatedOrgs = [...organizations];
        updatedOrgs[selectedOrgIndex] = updatedOrg;
        setOrganizations(updatedOrgs);
        setIsEditing(false);
        toast.success("Organisation mise à jour avec succès");
      } catch (error) {
        console.error("Error updating organization:", error);
        toast.error((error as Error).message || "Erreur lors de la mise à jour");
      }
    }
  };

  const handleInvite = async () => {
    if (organizations[selectedOrgIndex] && inviteEmail) {
      try {
        const response = await fetch(`/api/organizations/${organizations[selectedOrgIndex].id}/invitations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: inviteEmail }),
        });

        if (response.ok) {
          const newInvitation = await response.json();
          setInvitations([...invitations, newInvitation]);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Lien copié dans le presse-papier");
    } catch {
      toast.error("Erreur lors de la copie du lien");
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

  const selectedOrg = organizations[selectedOrgIndex];
  if (!selectedOrg) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Aucune organisation trouvée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = selectedOrg.users.some(
    (userOrg) =>
      userOrg.user.email === session?.user?.email && userOrg.role === "OWNER"
  );

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="p-6">
          {organizations.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto justify-between">
                        <Building2 className="h-4 w-4 mr-2" />
                        {selectedOrg.name}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {organizations.map((org, index) => (
                        <DropdownMenuItem
                          key={org.id}
                          onClick={() => setSelectedOrgIndex(index)}
                        >
                          {org.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <div className="space-y-4 w-full">
                      <div>
                        <Label htmlFor="name">Nom</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave}>Enregistrer</Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-muted-foreground">
                          {selectedOrg.description || "Aucune description"}
                        </p>
                      </div>
                      {isOwner && (
                        <Button onClick={handleEdit} variant="outline">
                          Modifier
                        </Button>
                      )}
                    </>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Créée le{" "}
                    {format(new Date(selectedOrg.createdAt), "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Membres ({selectedOrg.users.length})
                  </h3>
                  {isOwner && (
                    <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Inviter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Inviter un membre</DialogTitle>
                          <DialogDescription>
                            Envoyez une invitation par email pour rejoindre l&apos;organisation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Adresse email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="colleague@example.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                          <Button
                            onClick={handleInvite}
                            disabled={!inviteEmail}
                            className="w-full"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Envoyer l&apos;invitation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Liste des membres */}
                  <div className="grid gap-4">
                    {selectedOrg.users.map((userOrg) => (
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
                            hasPermission(selectedOrg.users.find(u => u.user.id === session?.user?.id)?.role as OrganizationRole || 'MEMBER', 'canManageRoles') && 
                            canManageRole(selectedOrg.users.find(u => u.user.id === session?.user?.id)?.role as OrganizationRole || 'MEMBER', userOrg.role as OrganizationRole) && (
                            <Select
                              defaultValue={userOrg.role}
                              onValueChange={async (newRole: OrganizationRole) => {
                                try {
                                  await updateMemberRole(selectedOrg.id, userOrg.user.id, newRole);
                                  const updatedOrgs = [...organizations];
                                  const orgIndex = organizations.findIndex(org => org.id === selectedOrg.id);
                                  const userIndex = updatedOrgs[orgIndex].users.findIndex(u => u.user.id === userOrg.user.id);
                                  updatedOrgs[orgIndex].users[userIndex].role = newRole;
                                  setOrganizations(updatedOrgs);
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
                                {getAssignableRoles(selectedOrg.users.find(u => u.user.id === session?.user?.id)?.role || 'MEMBER').map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                            {userOrg.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Liste des invitations en attente */}
                  {invitations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Invitations en attente
                      </h4>
                      <div className="grid gap-2">
                        {invitations.map((invitation) => (
                          <div
                            key={invitation.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-dashed"
                          >
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {invitation.email || "Invitation par lien"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Invité par {invitation.invitedBy?.name || invitation.invitedBy?.email || "Utilisateur inconnu"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Expire le{" "}
                                {format(new Date(invitation.expiresAt), "d MMM", {
                                  locale: fr,
                                })}
                              </span>
                              {isOwner && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    // TODO: Ajouter la logique pour annuler l'invitation
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isOwner && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Section des invitations par email */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Inviter par email
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                            <DialogTrigger asChild>
                              <Button>
                                <Mail className="h-4 w-4 mr-2" />
                                Inviter par email
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Inviter un membre</DialogTitle>
                                <DialogDescription>
                                  Envoyez une invitation par email pour rejoindre votre organisation.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="email@exemple.com"
                                  />
                                </div>
                                <Button onClick={handleInvite} className="w-full">
                                  Envoyer l&apos;invitation
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section des invitations par lien */}
                    <InvitationLinks 
                      organizationId={selectedOrg.id}
                      onInvitationCreated={(invitation) => {
                        setInvitations([...invitations, invitation]);
                      }}
                    />
                  </div>

                  {/* Liste des invitations en attente */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Invitations en attente
                    </h3>
                    <div className="space-y-4">
                      {invitations.length > 0 ? (
                        invitations.map((invitation) => (
                          <Card key={invitation.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <Avatar>
                                    <AvatarFallback>
                                      {invitation.email ? invitation.email[0].toUpperCase() : "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{invitation.email || "Invitation par lien"}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Invité par {invitation.invitedBy?.name || invitation.invitedBy?.email || "Utilisateur inconnu"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Expire le {format(new Date(invitation.expiresAt), "dd MMMM yyyy", { locale: fr })}
                                    </p>
                                  </div>
                                </div>
                                {invitation.email ? (
                                  <Button variant="ghost" size="icon">
                                    <X className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/${invitation.token}`)}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copier le lien
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground">
                          Aucune invitation en attente
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Aucune organisation trouvée.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 