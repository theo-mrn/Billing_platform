"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getProjectModules } from "@/app/actions/projects";
import { type Prisma } from "@prisma/client";

interface Module {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isActive: boolean;
  settings: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

interface ModulesClientProps {
  id: string;
}

export default function ModulesClient({ id }: ModulesClientProps) {
  const { data: session, status } = useSession();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      if (session?.user?.email) {
        try {
          const data = await getProjectModules(id);
          setModules(data);
        } catch (error) {
          console.error("Error fetching modules:", error);
          toast.error((error as Error).message || "Erreur lors de la récupération des modules");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchModules();
  }, [id, session]);

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
              Veuillez vous connecter pour voir les modules.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="p-6">
          {modules.length > 0 ? (
            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module.id} className="border p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">{module.name}</h3>
                  <p className="text-muted-foreground">{module.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-1 bg-primary/10 rounded-full">
                      {module.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Aucun module trouvé.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 