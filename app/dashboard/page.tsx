// File: app/dashboard/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  CognitiveProjectDialog,
  CognitiveCapacityBanner,
  CognitiveProjectList
} from "@/components/cognitive"
import { ChatComponent } from "@/components/chat-component"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TimeReportCardWrapper } from "@/components/TimeReportCardWrapper";
import { DashboardHeader, DashboardSectionTitle } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select(`*, tasks ( title )`)
    .eq('user_id', data.user.id)
    .gte('start_time', sevenDaysAgo);

  return (
    <div className="min-h-screen bg-[#E0E5EC]">
      {/* Header with Language Toggle */}
      <DashboardHeader email={data.user.email || ''}>
        <CognitiveProjectDialog>
          <Button
            className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 text-white font-medium border-0"
            style={{
              background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
              boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.4)'
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Nuevo</span>
          </Button>
        </CognitiveProjectDialog>
      </DashboardHeader>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <CognitiveCapacityBanner projects={projects || []} />

        <div className="hidden sm:block">
          <ChatComponent />
        </div>

        <div>
          <TimeReportCardWrapper />
        </div>

        <div>
          <DashboardSectionTitle />
          <CognitiveProjectList projects={projects || []} />
        </div>
      </main>
    </div>
  )
}