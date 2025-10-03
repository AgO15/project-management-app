// File: app/dashboard/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectList } from "@/components/project-list"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { ChatComponent } from "@/components/chat-component"
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"

// --- 1. Import the new TimeReportCard component ---
import { TimeReportCard } from "@/components/TimeReportCard";

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  // --- 2. Add the code to fetch time entries from the last 7 days ---
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select(`
      *,
      tasks ( title )
    `)
    .eq('user_id', data.user.id)
    .gte('start_time', sevenDaysAgo);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Project Manager</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {data.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <CreateProjectDialog>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </CreateProjectDialog>
              <form action="/auth/logout" method="post">
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <ChatComponent />
        </div>

        {/* --- 3. Add the TimeReportCard component to the page --- */}
        <div className="mb-8">
          <TimeReportCard timeEntries={timeEntries || []} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Your Projects</h2>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>

        <ProjectList projects={projects || []} />
      </main>
    </div>
  )
}