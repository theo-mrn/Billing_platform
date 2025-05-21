"use client"

import { useSession } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar2"
import {
  LogOut,
  UserCircle,
  //ChartNoAxesCombined,
  Layout,
  FileText,
  BrainCircuit,
  Home,
  PencilRuler,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { Button } from "./button"
import { XPDisplay } from "./XPDisplay"
import { OrganizationSelector } from "./OrganizationSelector"
import { ProjectSelector } from "./ProjectSelector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { usePathname } from "next/navigation"
import Pomodoro from "@/components/Pomodoro"
import { useState } from "react"
import { MusicPlayer } from "./MusicPlayer"

const globalNavigationItems = [
  {
    title: "Projets",
    href: "/projects",
    icon: Layout,
  },
]

const getProjectNavigationItems = (projectId: string) => [
  {
    title: "Brouillons",
    href: `/projects/${projectId}/draft`,
    icon: PencilRuler,
  },
  {
    title: "Documents",
    href: `/projects/${projectId}/texte`,
    icon: FileText,
  },
  {
    title: "Flashcards",
    href: `/projects/${projectId}/flashcards`,
    icon: BrainCircuit,
  },
]

export function AppSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("")
  
  // Extract project ID from URL if we're in a project route
  const projectIdMatch = pathname.match(/\/projects\/([^\/]+)/)
  const projectIdFromUrl = projectIdMatch ? projectIdMatch[1] : ""
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdFromUrl)

  const projectNavigationItems = selectedProjectId 
    ? getProjectNavigationItems(selectedProjectId)
    : []

  const handleOrganizationSelect = (orgId: string) => {
    setSelectedOrganizationId(orgId)
    // Don't reset project selection when organization changes if we're in a project route
    if (!projectIdFromUrl) {
      setSelectedProjectId("")
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="space-y-2 pb-4">
        <div className="px-3 pt-2">
          <OrganizationSelector 
            isCollapsed={false} 
            onOrganizationSelect={handleOrganizationSelect}
          />
        </div>
        {selectedOrganizationId && (
          <div className="px-3 pt-2">
            <ProjectSelector 
              organizationId={selectedOrganizationId}
              isCollapsed={false}
              onOpenChange={() => {}}
              onProjectSelect={setSelectedProjectId}
            />
          </div>
        )}
        <div className="px-3">
          <div className="flex items-center gap-3">
          <Link href="/" className="hover:text-primary">
              <Home className="h-5 w-5" />
          </Link>
            <XPDisplay />
          </div>
        </div>
        <div className="px-3">
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/"}
              tooltip="Home"
              className="h-10"
            >
            </SidebarMenuButton>
          </SidebarMenuItem>

          {globalNavigationItems.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  className="h-10"
                >
                  <Link href={item.href} className="flex items-center gap-3 px-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}

          {selectedProjectId && (
            <>
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  PROJET
                </div>
              </div>
              {projectNavigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className="h-10"
                    >
                      <Link href={item.href} className="flex items-center gap-3 px-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <div className="px-3 pb-2">
        <Pomodoro mini={false} />
      </div>
      <SidebarFooter className="border-t">
        <div className="space-y-1 p-3">
          <MusicPlayer />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 h-10">
                <div className="relative w-5 h-5 rounded-full overflow-hidden ring-1 ring-border">
                  <Image
                    alt="User"
                    src={session?.user?.image || "/placeholder.svg"}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-medium">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="flex items-center gap-3 p-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-border">
                  <Image
                    alt="User"
                    src={session?.user?.image || "/placeholder.svg"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session?.user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session?.user?.email}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="h-9">
                <Link href="/account" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="h-9">
                <Link href="/organization" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Organisation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="h-9">
                <Link href="/api/auth/signout" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Sign out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 