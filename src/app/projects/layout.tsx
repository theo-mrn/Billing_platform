import { SessionNavBar } from "@/components/ui/sidebar"

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <SessionNavBar />
      <main className="flex-1 md:pl-[3.05rem]">
        {children}
      </main>
    </div>
  );
}
