import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface OrganizationContextType {
  selectedOrg: string | null;
  setSelectedOrg: (orgId: string | null) => void;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  // Effet pour charger l'organisation depuis le localStorage
  useEffect(() => {
    const storedOrg = localStorage.getItem('selectedOrg');
    if (storedOrg) {
      setSelectedOrg(storedOrg);
    }
    setIsLoading(false);
  }, []);

  // Effet pour charger l'organisation par défaut si nécessaire
  useEffect(() => {
    const fetchDefaultOrg = async () => {
      if (!session?.user?.email || selectedOrg || isLoading) return;

      try {
        const response = await fetch('/api/organizations/user');
        if (response.ok) {
          const organizations = await response.json();
          if (organizations.length > 0) {
            const defaultOrg = organizations[0].id;
            setSelectedOrg(defaultOrg);
            localStorage.setItem('selectedOrg', defaultOrg);
          }
        }
      } catch (error) {
        console.error('Error fetching default organization:', error);
      }
    };

    fetchDefaultOrg();
  }, [session, selectedOrg, isLoading]);

  // Persister la sélection dans le localStorage
  const handleSetSelectedOrg = (orgId: string | null) => {
    setSelectedOrg(orgId);
    if (orgId) {
      localStorage.setItem('selectedOrg', orgId);
    } else {
      localStorage.removeItem('selectedOrg');
    }
  };

  return (
    <OrganizationContext.Provider 
      value={{ 
        selectedOrg, 
        setSelectedOrg: handleSetSelectedOrg,
        isLoading 
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
} 