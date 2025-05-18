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
  Moon,
  LogOut,
  UserCircle,
  //ChartNoAxesCombined,
  Layout,
  FileText,
  BrainCircuit,
  ListTodo,
  Home,
  CreditCard
} from "lucide-react"
import { useTheme } from "@/lib/themes"
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
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Organisation",
    href: "/organization",
    icon: CreditCard,
  },
  {
    title: "Projet",
    href: "/projects",
    icon: Layout,
  },
  // {
  //   title: "Statistiques",
  //   href: "/stats",
  //   icon: ChartNoAxesCombined,
  // },
]

const getProjectNavigationItems = (projectId: string) => [
  {
    title: "Vue d'ensemble",
    href: `/projects/${projectId}`,
    icon: Layout,
  },
  {
    title: "Tâches",
    href: `/projects/${projectId}/tasks`,
    icon: ListTodo,
  },
  {
    title: "Documents",
    href: `/projects/${projectId}/documents`,
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
  const { setTheme } = useTheme()
  const pathname = usePathname()
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  const projectNavigationItems = selectedProjectId 
    ? getProjectNavigationItems(selectedProjectId)
    : []

  const handleOrganizationSelect = (orgId: string) => {
    setSelectedOrganizationId(orgId)
    setSelectedProjectId("") // Reset project selection when organization changes
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
          <XPDisplay />
        </div>
        <div className="px-3">
          <Pomodoro />
        </div>
        <div className="px-3">
          <MusicPlayer />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="space-y-1">
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
      <SidebarFooter className="border-t">
        <div className="space-y-1 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 h-10">
                <Moon className="h-5 w-5" />
                <span className="font-medium">Theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => setTheme('dark')} className="h-9">
                <Moon className="h-4 w-4 mr-2" /> Theme 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark3')} className="h-9">
                <Moon className="h-4 w-4 mr-2" /> Theme 2
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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