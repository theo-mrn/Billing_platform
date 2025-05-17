import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { toast } from "sonner";
import { useOrganization } from "@/contexts/OrganizationContext";

interface Organization {
  id: string;
  name: string;
}

interface OrganizationSelectorProps {
  isCollapsed: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function OrganizationSelector({ isCollapsed, onOpenChange }: OrganizationSelectorProps) {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const { selectedOrg, setSelectedOrg } = useOrganization();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/organizations/user");
        if (response.ok) {
          const data = await response.json();
          const orgs = data.map((org: { id: string; name: string }) => ({
            id: org.id,
            name: org.name,
          }));
          setOrganizations(orgs);
          if (orgs.length > 0 && !selectedOrg) {
            setSelectedOrg(orgs[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error("Erreur lors de la récupération des organisations");
      }
    };

    if (session?.user?.email) {
      fetchOrganizations();
    }
  }, [session?.user?.email, selectedOrg, setSelectedOrg]);

  if (isCollapsed) {
    return null;
  }

  return (
    <Select 
      value={selectedOrg || ""} 
      onValueChange={setSelectedOrg}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger className="w-full bg-background hover:bg-accent rounded-lg">
        <SelectValue placeholder="Sélectionner une organisation" className="text-sm font-medium" />
      </SelectTrigger>
      <SelectContent className="w-full min-w-[200px]" sideOffset={4} align="start">
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id} className="text-sm">
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 