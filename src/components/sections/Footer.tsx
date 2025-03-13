import { config } from "@/app/config";


export function Footer() {
  return (
    <footer className="py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">{config.name}</h3>
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-right">
            Conçu et développé avec passion
          </p>
        </div>
      </div>
    </footer>
  )
} 