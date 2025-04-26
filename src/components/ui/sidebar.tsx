"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  BarChart3,
  CreditCard,
  Home,
  CalendarDays,
  Wallet,
  ChevronsUpDown,
  UserCircle,
  LogOut,
  ArrowUpRight,
  Moon,
  Menu
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useTheme, Theme } from "@/lib/themes";
import { Session } from "next-auth";

const navigationItems = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Revenus",
    href: "/dashboard/income",
    icon: ArrowUpRight,
  },
  {
    title: "Abonnements",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Calendrier",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    title: "Bilan",
    href: "/dashboard/balance",
    icon: Wallet,
  },
  {
    title: "Rapports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
];

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "4rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

interface SidebarContentProps {
  isCollapsed: boolean;
  setTheme: (theme: Theme) => void;
  session: Session | null;
  pathname: string;
}

function SidebarContent({ isCollapsed, setTheme, session, pathname }: SidebarContentProps) {
  return (
    <motion.div
      className="relative z-40 flex h-full shrink-0 flex-col"
      variants={contentVariants}
    >
      <motion.ul variants={staggerVariants} className="flex h-full flex-col">
        <div className="flex grow flex-col items-center">
          <div className="flex h-[54px] w-full shrink-0 border-b border-border p-4" />
          <div className="flex h-full w-full flex-col">
            <div className="flex grow flex-col gap-4">
              <ScrollArea className="h-16 grow p-2">
                <div className={cn("flex w-full flex-col gap-2")}> 
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex h-10 w-full flex-row items-center rounded-md px-3 py-2 transition hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-3 text-sm font-medium">{item.title}</p>
                        )}
                      </motion.li>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex flex-col p-2">
              <div className="mb-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full">
                    <div className="flex h-10 w-full flex-row items-center gap-2 rounded-md px-3 py-2 transition hover:bg-accent hover:text-accent-foreground">
                      <Moon className="h-5 w-5" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="text-sm font-medium">Theme</p>
                        )}
                      </motion.li>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={5}>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="h-4 w-4 mr-2" /> Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark2')}>
                      <Moon className="h-4 w-4 mr-2" /> Dark 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark3')}>
                      <Moon className="h-4 w-4 mr-2" /> Dark 3
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full">
                    <div className="flex h-10 w-full flex-row items-center gap-2 rounded-md px-3 py-2 transition hover:bg-accent hover:text-accent-foreground">
                      <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-primary">
                        <Image
                          alt="User"
                          src={session?.user?.image || "/placeholder.svg"}
                          width={28}
                          height={28}
                          className="object-cover"
                        />
                      </div>
                      <motion.li
                        variants={variants}
                        className="flex w-full items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">Account</p>
                            <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={5}>
                    <div className="flex flex-row items-center gap-2 p-2">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary">
                        <Image
                          alt="User"
                          src={session?.user?.image || "/placeholder.svg"}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">
                          {session?.user?.name || "User"}
                        </span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {session?.user?.email || ""}
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link href="/account">
                        <UserCircle className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </motion.ul>
    </motion.div>
  );
}

export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setTheme } = useTheme();

  // Sidebar classes responsive
  const sidebarBase = "sidebar fixed left-0 top-0 z-40 h-full shrink-0 border-r border-border bg-card text-card-foreground transition-all duration-200";
  const sidebarDesktop = "hidden md:block w-[3.05rem] hover:w-[15rem]";
  const sidebarMobile = mobileOpen ? "block w-60 z-50 bg-card/95" : "hidden";

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-card p-2 rounded-full shadow border border-border"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar for desktop */}
      <motion.div
        className={cn(sidebarBase, sidebarDesktop)}
        initial={isCollapsed ? "closed" : "open"}
        animate={isCollapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={transitionProps}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <SidebarContent isCollapsed={isCollapsed} setTheme={setTheme} session={session} pathname={pathname} />
      </motion.div>

      {/* Sidebar for mobile overlay */}
      <motion.div
        className={cn(sidebarBase, sidebarMobile)}
        initial={mobileOpen ? "open" : "closed"}
        animate={mobileOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={transitionProps}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-50 bg-card p-2 rounded-full shadow border border-border md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        >
          <Menu className="h-6 w-6 rotate-90" />
        </button>
        <SidebarContent isCollapsed={false} setTheme={setTheme} session={session} pathname={pathname} />
      </motion.div>
    </>
  );
}
