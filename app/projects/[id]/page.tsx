// Archivo: app/projects/[id]/page.tsx

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

  // Tu lógica para obtener datos de la base de datos (sin cambios)
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", data.user.id)
    .single()

  if (!project) {
    redirect("/dashboard")
  }

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
        <div className="container mx-auto px-3 sm:px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <ProjectHeader project={project} />
            </div>
            {/* --- CAMBIO 1: El botón "New Task" se ha quitado de aquí --- */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4"> {/* Reducido el espacio para un mejor ajuste */}
            
            {/* --- CAMBIO 2: El botón "New Task" ahora está aquí --- */}
            <CreateTaskDialog projectId={id}>
              {/* La clase "w-full" lo hace extenderse de extremo a extremo */}
              <Button className="w-full py-3 text-base flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </CreateTaskDialog>
            {/* -------------------------------------------------------- */}

            <TaskList
              tasks={tasks || []}
              projectId={id}
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