"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Bell, Lock, User, Upload, X, Camera, Mail, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/sections/Header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const { data: session } = useSession();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [mounted, setMounted] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session?.user?.email) {
      checkSubscription(session.user.email);
    }
  }, [session]);

  async function checkSubscription(email: string) {
    try {
      const res = await fetch(`/api/resend/subscription-status?email=${email}`);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erreur lors de la vérification de l'abonnement:", errorData.error);
        setSubscribed(false);
        return;
      }
      const data = await res.json();
      setSubscribed(data.subscribed);
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement:", error);
      setSubscribed(false);
    }
  }

  async function toggleSubscription() {
    if (!session?.user?.email) return;
    setLoading(true);
    setMessage("");

    const newStatus = !subscribed;
    try {
      const res = await fetch("/api/resend/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          unsubscribe: !newStatus,
        }),
      });

      if (res.ok) {
        setSubscribed(newStatus);
        setMessage(newStatus ? "Vous êtes maintenant abonné." : "Vous êtes désinscrit.");
      } else {
        const data = await res.json();
        setMessage(data.error || "Erreur lors de la mise à jour de votre abonnement.");
        await checkSubscription(session.user.email);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setMessage("Erreur de connexion.");
      await checkSubscription(session.user.email);
    }
    setLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Les mots de passe ne correspondent pas");
      return;
    }

    setChangingPassword(true);
    setPasswordMessage("");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage("Mot de passe mis à jour avec succès");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage(data.error || "Erreur lors de la mise à jour du mot de passe");
      }
    } catch (error) {
      setPasswordMessage("Erreur de connexion");
      console.error("Erreur de connexion:", error);
    }

    setChangingPassword(false);
  }

  if (!session) {
    return (
   
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Header/>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-center text-gray-600">Veuillez vous connecter pour accéder à votre compte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-40 px-4 md:px-6 flex flex-col items-center ">
      <Header/>
      <Card className={cn(
        "w-full max-w-4xl mx-auto overflow-hidden transition-all duration-500",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}>
        {/* Profile Header */}
        <div className="bg-primary px-8 py-8 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              {/* Profile Avatar */}
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <div className="cursor-pointer group relative">
                    <Avatar className="h-28 w-28 border-4 border-primary-foreground/20 shadow-xl transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src={session.user?.image || "/placeholder.svg"} alt={session.user?.name || "User"} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Mettre à jour la photo de profil</DialogTitle>
                    <DialogDescription>Téléchargez une nouvelle photo de profil ou supprimez l&apos;actuelle.</DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex justify-center py-4">
                      <Avatar className="h-32 w-32 border-4 border-muted">
                        <AvatarImage src={session.user?.image || "/placeholder.svg"} alt={session.user?.name || "User"} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-3xl">
                          {session.user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                      <Upload className="mr-2 h-4 w-4" />
                      Télécharger une nouvelle image
                    </button>
                    <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      <X className="mr-2 h-4 w-4" />
                      Supprimer la photo
                    </button>
                    <p className="text-xs text-muted-foreground text-center">JPG, GIF ou PNG. Taille max 2MB.</p>
                  </div>
                </DialogContent>
              </Dialog>

              {/* User Info */}
              <div>
                <h2 className="text-3xl font-bold text-primary-foreground tracking-tight">
                  {session.user?.name || "Utilisateur"}
                </h2>
                <p className="text-primary-foreground/80">{session.user?.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <CardContent className="px-0 py-0">
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="h-16 w-full rounded-none bg-transparent border-b border-transparent justify-start px-6">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2 h-16 rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary border-transparent transition-all relative"
                >
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2 h-16 rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary border-transparent transition-all relative"
                >
                  <Lock className="h-4 w-4" />
                  <span>Sécurité</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center gap-2 h-16 rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary border-transparent transition-all relative"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent
                value="profile"
                className={cn(
                  "space-y-6 mt-0 transition-all duration-300",
                  activeTab === "profile" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                )}
              >
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nom
                      </Label>
                      <Input
                        id="name"
                        defaultValue={session.user?.name || ""}
                        className="transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          defaultValue={session.user?.email || ""}
                          className="pl-10 transition-all duration-200"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="security"
                className={cn(
                  "space-y-6 mt-0 transition-all duration-300",
                  activeTab === "security" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                )}
              >
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl mx-auto">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      Mot de passe actuel
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">
                      Nouveau mot de passe
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmer le mot de passe
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="transition-all duration-200"
                      required
                    />
                  </div>
                  {passwordMessage && (
                    <p className={cn(
                      "text-sm",
                      passwordMessage.includes("succès") ? "text-green-600" : "text-red-600"
                    )}>
                      {passwordMessage}
                    </p>
                  )}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {changingPassword ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent
                value="notifications"
                className={cn(
                  "space-y-6 mt-0 transition-all duration-300",
                  activeTab === "notifications" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                )}
              >
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/20 hover:bg-muted/50 transition-colors duration-200">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Notifications par email</h4>
                      <p className="text-sm text-muted-foreground">
                        Statut : {subscribed === null ? "Chargement..." : subscribed ? "Abonné ✅" : "Non abonné ❌"}
                      </p>
                      {message && (
                        <p className="text-sm text-muted-foreground">{message}</p>
                      )}
                    </div>
                    <Switch
                      checked={subscribed || false}
                      onCheckedChange={toggleSubscription}
                      disabled={loading || subscribed === null}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}