import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatComponent } from "@/components/chat-component"

export default async function Home() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Granular Task Dashboard</h1>
          <p className="text-muted-foreground text-pretty">
            Chat with your AI assistant to manage and break down your tasks into actionable steps
          </p>
        </div>

        <ChatComponent />
      </div>
    </main>
  )
}