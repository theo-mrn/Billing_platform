"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InvitationDetails {
  organization: {
    name: string;
    description: string | null;
  };
  email: string;
  expiresAt: string;
  status: string;
}

export default function InvitationPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${params.token}`);
        if (response.ok) {
          const data = await response.json();
          setInvitation(data);
        } else {
          const error = await response.json();
          toast.error(error.error || "Erreur lors de la récupération de l'invitation");
        }
      } catch (error) {
        console.error("Error fetching invitation:", error);
        toast.error("Erreur lors de la récupération de l'invitation");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchInvitation();
    }
  }, [params.token, session]);

  const handleAcceptInvitation = async () => {
    setIsAccepting(true);
    try {
      const response = await fetch(`/api/invitations/${params.token}`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        router.push("/organization");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de l'acceptation de l'invitation");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Erreur lors de l'acceptation de l'invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-24 w-full" />
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
              Veuillez vous connecter pour accepter l&apos;invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Invitation non trouvée ou expirée.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isWrongEmail = invitation.email && invitation.email !== session?.user?.email;

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Building2 className="h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold">
              Invitation à rejoindre {invitation.organization.name}
            </h1>
            <p className="text-muted-foreground">
              {invitation.organization.description || "Aucune description"}
            </p>

            {isExpired ? (
              <p className="text-destructive">Cette invitation a expiré.</p>
            ) : isWrongEmail ? (
              <p className="text-destructive">
                Cette invitation est destinée à {invitation.email}. Veuillez vous
                connecter avec le bon compte.
              </p>
            ) : (
              <Button
                onClick={handleAcceptInvitation}
                disabled={isAccepting}
                className="w-full max-w-sm"
              >
                {isAccepting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Accepter l&apos;invitation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 