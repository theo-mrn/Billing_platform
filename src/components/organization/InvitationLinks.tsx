import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  inviteUrl: string;
}

interface InvitationLinksProps {
  organizationId: string;
  onInvitationCreated?: (invitation: Invitation) => void;
}

export function InvitationLinks({ organizationId, onInvitationCreated }: InvitationLinksProps) {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "MEMBER" }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedLink(data.inviteUrl);
        if (onInvitationCreated) {
          onInvitationCreated(data);
        }
        toast.success("Lien d&apos;invitation généré avec succès");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de la génération du lien");
      }
    } catch (error) {
      console.error("Error generating invitation link:", error);
      toast.error("Erreur lors de la génération du lien");
    } finally {
      setIsLoading(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Inviter par lien
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleGenerateLink} disabled={isLoading}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Générer un lien d&apos;invitation
              </Button>
            </DialogTrigger>
            {generatedLink && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Lien d&apos;invitation généré</DialogTitle>
                  <DialogDescription>
                    Partagez ce lien avec les personnes que vous souhaitez inviter
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 mt-4">
                  <Input value={generatedLink} readOnly />
                  <Button onClick={() => copyToClipboard(generatedLink)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
} 