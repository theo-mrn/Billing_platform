import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Project = {
  id: string
  name: string
  description: string | null
}

type ProjectSelectorProps = {
  organizationId: string
  isCollapsed: boolean
  onOpenChange: (open: boolean) => void
  onProjectSelect?: (projectId: string) => void
}

export function ProjectSelector({
  organizationId,
  isCollapsed,
  onOpenChange,
  onProjectSelect
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/organizations/${organizationId}/projects`)
        const data = await response.json()
        setProjects(data)
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0].id)
          onProjectSelect?.(data[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }

    if (organizationId) {
      fetchProjects()
    }
  }, [organizationId, selectedProject, onProjectSelect])

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId)
    onProjectSelect?.(projectId)
    router.push(`/projects/${projectId}`)
  }

  if (isCollapsed) {
    return null
  }

  return (
    <Select 
      value={selectedProject} 
      onValueChange={handleProjectSelect}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger className="w-full bg-background hover:bg-accent rounded-lg">
        <SelectValue placeholder="Sélectionner un projet" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 