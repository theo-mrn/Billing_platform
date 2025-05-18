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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar2"
import {
  BarChart3,
  CreditCard,
  Home,
  Moon,
  LogOut,
  UserCircle,
} from "lucide-react"
import { useTheme } from "@/lib/themes"
import Link from "next/link"
import { Button } from "./button"
import { XPDisplay } from "./XPDisplay"
import { OrganizationSelector } from "./OrganizationSelector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { usePathname } from "next/navigation"

const navigationItems = [
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
    title: "Mes projets",
    href: "/projects",
    icon: BarChart3,
  },
]

export function SessionNavBar() {
  const { data: session } = useSession()
  const { setTheme } = useTheme()
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between px-4">
            <OrganizationSelector isCollapsed={false} />
            <SidebarTrigger />
          </div>
          <div className="px-2 py-2">
            <XPDisplay />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-3 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Moon className="h-4 w-4" />
                  <span>Theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="h-4 w-4 mr-2" /> Theme 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark3')}>
                  <Moon className="h-4 w-4 mr-2" /> Theme 2
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-primary">
                    <Image
                      alt="User"
                      src={session?.user?.image || "/placeholder.svg"}
                      width={28}
                      height={28}
                      className="object-cover"
                    />
                  </div>
                  <span>Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="flex items-center gap-2 p-2">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary">
                    <Image
                      alt="User"
                      src={session?.user?.image || "/placeholder.svg"}
                      width={40}
                      height={40}
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
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Sign out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
} 