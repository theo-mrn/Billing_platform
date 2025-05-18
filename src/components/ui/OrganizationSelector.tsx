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

interface Organization {
  id: string;
  name: string;
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

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await getOrganizations();
        const formattedOrgs = orgs.map((org) => ({
          id: org.id,
          name: org.name,
        }));
        setOrganizations(formattedOrgs);
        if (formattedOrgs.length > 0 && !selectedOrg) {
          setSelectedOrg(formattedOrgs[0].id);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error("Erreur lors de la récupération des organisations");
      }
    };

    if (session?.user?.email) {
      fetchOrganizations();
    }
  }, [session?.user?.email, selectedOrg, setSelectedOrg, refreshTrigger]);

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
          <SelectItem key={org.id} value={org.id} className="text-sm">
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 