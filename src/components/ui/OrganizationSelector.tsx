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
import { getOrganizations } from "@/app/actions/organizations";
import type { OrganizationRole } from "@/lib/permissions";

interface Organization {
  id: string;
  name: string;
  role: OrganizationRole;
  isDefault: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationSelectorProps = {
  isCollapsed?: boolean
  onOrganizationSelect?: (organizationId: string) => void
  refreshTrigger?: number
}

export function OrganizationSelector({
  isCollapsed = false,
  onOrganizationSelect,
  refreshTrigger = 0
}: OrganizationSelectorProps) {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const { selectedOrg, setSelectedOrg } = useOrganization();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await getOrganizations();
        const formattedOrgs = orgs.map((org) => ({
          id: org.id,
          name: org.name,
          role: org.role,
          isDefault: org.isDefault,
          description: org.description,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt
        }));
        setOrganizations(formattedOrgs);

        // Si aucune organisation n'est sélectionnée
        if (!selectedOrg && formattedOrgs.length > 0 && !isInitialized) {
          // Chercher d'abord l'organisation par défaut
          const defaultOrg = formattedOrgs.find(org => org.isDefault);
          if (defaultOrg) {
            console.log('Selecting default organization:', defaultOrg.name);
            setSelectedOrg(defaultOrg.id);
            onOrganizationSelect?.(defaultOrg.id);
          } else {
            // Si pas d'organisation par défaut, prendre la première
            console.log('Selecting first organization:', formattedOrgs[0].name);
            setSelectedOrg(formattedOrgs[0].id);
            onOrganizationSelect?.(formattedOrgs[0].id);
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error("Erreur lors de la récupération des organisations");
      }
    };

    if (session?.user?.email) {
      fetchOrganizations();
    }
  }, [session?.user?.email, selectedOrg, setSelectedOrg, refreshTrigger, onOrganizationSelect, isInitialized]);

  const handleOrganizationSelect = (value: string) => {
    setSelectedOrg(value);
    onOrganizationSelect?.(value);
  };

  if (isCollapsed) {
    return null;
  }

  return (
    <Select 
      value={selectedOrg || ""} 
      onValueChange={handleOrganizationSelect}
    >
      <SelectTrigger className="w-full bg-background hover:bg-accent rounded-lg">
        <SelectValue placeholder="Sélectionner une organisation" className="text-sm font-medium" />
      </SelectTrigger>
      <SelectContent className="w-full min-w-[200px]" sideOffset={4} align="start">
        {organizations.map((org) => (
          <SelectItem 
            key={org.id} 
            value={org.id} 
            className={`text-sm ${org.isDefault ? 'font-semibold' : ''}`}
          >
            {org.name} {org.isDefault && '(Par défaut)'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 