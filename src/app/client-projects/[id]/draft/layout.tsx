"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import ProjectTodoSidebar from "@/components/ProjectTodoSidebar"
import { Button } from "@/components/ui/button"
import { PanelRightClose, PanelRightOpen } from "lucide-react"
import { AppSidebar } from "@/components/ui/AppSidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar2"

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const params = useParams()
  const projectId = params.id as string

  return (
    <div className="flex gap-0 relative">
      <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 items-center border-b px-6">
            <SidebarTrigger />
          </div>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>      
      <div className="flex items-start gap-0">
        <Button
          variant="ghost"
          size="icon"
          className="relative -left-3 top-4 z-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </Button>

        <div className={`transition-all duration-300 ${isSidebarOpen ? ' border-none mr-6 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
          <ProjectTodoSidebar projectId={projectId} />
        </div>
      </div>
    </div>
  )
} 