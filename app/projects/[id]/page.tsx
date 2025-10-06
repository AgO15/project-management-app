import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TaskList } from "@/components/task-list"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { ProjectHeader } from "@/components/project-header"
import { ProjectNotes } from "@/components/project-notes"
import { FileUpload } from "@/components/file-upload"
import { ProjectTimeSummary } from "@/components/project-time-summary"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", data.user.id)
    .single()

  if (!project) {
    redirect("/dashboard")
  }

  // Fetch project tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  const { data: projectNotes } = await supabase
    .from("notes")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  const { data: projectFiles } = await supabase
    .from("files")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <ProjectHeader project={project} />
            </div>
            {/* Actions menu removed per UX request. New Task button moved above filters. */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TaskList
              tasks={tasks || []}
              projectId={id}
              createButton={
                <CreateTaskDialog projectId={id}>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                </CreateTaskDialog>
              }
            />
          </div>

          <div className="space-y-6">
            <ProjectTimeSummary projectId={id} />

            <ProjectNotes projectId={id} notes={projectNotes || []} />

            <FileUpload projectId={id} files={projectFiles || []} title="Project Files" />
          </div>
        </div>
      </main>
    </div>
  )
}
