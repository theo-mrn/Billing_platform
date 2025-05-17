"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  BarChart3,
  CreditCard,
  Home,
  ChevronsUpDown,
  UserCircle,
  LogOut,
  Moon,
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
import { XPDisplay } from "./XPDisplay";
import { useXP } from "@/hooks/useXP";
import { OrganizationSelector } from "./OrganizationSelector";


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
];

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
  onSelectOpen: (isOpen: boolean) => void;
}

function SidebarContent({ isCollapsed, setTheme, session, pathname, onSelectOpen }: SidebarContentProps) {
  const { xp, level, isLoading } = useXP();

  return (
    <motion.div
      className="relative z-40 flex h-full shrink-0 flex-col"
      variants={contentVariants}
    >
      <motion.ul variants={staggerVariants} className="flex h-full flex-col">
        <div className="flex grow flex-col items-center">
          <div className="flex h-[54px] w-full shrink-0 items-center justify-between border-b border-border px-4">
            {!isCollapsed && (
              <OrganizationSelector isCollapsed={isCollapsed} onOpenChange={onSelectOpen} />
            )}
          </div>
          {!isCollapsed && !isLoading && (
            <div className="w-full px-2 py-4">
              <XPDisplay xp={xp} level={level} />
            </div>
          )}
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
                      <Moon className="h-4 w-4 mr-2" /> Theme 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark3')}>
                      <Moon className="h-4 w-4 mr-2" /> Theme 2
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

// Add this new component before SessionNavBar
function MobileTabBar({ pathname, session }: { pathname: string; session: Session | null }) {
  return (
    <>
      {/* Spacer div to prevent content from being hidden behind the tabbar */}
      <div className="md:hidden h-20 w-full" />
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-[100]">
        <nav className="flex justify-around items-center h-16 px-4">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 py-2 rounded-md transition z-[100]",
                pathname === item.href 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          ))}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex flex-col items-center justify-center w-16 py-2 z-[100]">
              <div className="relative w-5 h-5 rounded-full overflow-hidden ring-1 ring-primary">
                <Image
                  alt="User"
                  src={session?.user?.image || "/placeholder.svg"}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs mt-1">Compte</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="mb-2 z-[100]">
              <div className="flex flex-row items-center gap-2 p-2">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary">
                  <Image
                    alt="User"
                    src={session?.user?.image || "/placeholder.svg"}
                    fill
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
              <DropdownMenuItem asChild className="flex items-center gap-2">
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
        </nav>
      </div>
    </>
  );
}

export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setTheme } = useTheme();

  // Sidebar classes responsive
  const sidebarBase = "sidebar fixed left-0 top-0 z-40 h-full shrink-0 border-r border-border bg-card text-card-foreground transition-all duration-200";
  const sidebarDesktop = "hidden md:block w-[3.05rem] hover:w-[15rem]";

  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };

  const handleSelectOpenChange = (open: boolean) => {
    setIsSelectOpen(open);
    if (open) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    // Ne replie la sidebar que si le select n'est pas ouvert
    if (!isSelectOpen) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          sidebarBase, 
          sidebarDesktop,
          isSelectOpen ? "w-[15rem]" : ""
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          setTheme={setTheme}
          session={session}
          pathname={pathname}
          onSelectOpen={handleSelectOpenChange}
        />
      </div>

      {/* Mobile TabBar */}
      <MobileTabBar pathname={pathname} session={session} />
    </>
  );
}
