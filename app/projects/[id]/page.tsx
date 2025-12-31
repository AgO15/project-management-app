// Archivo: app/projects/[id]/page.tsx

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TaskList } from "@/components/task-list"
import { IfThenTaskDialog, ProjectCognitiveSettings } from "@/components/cognitive"
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

  // Obtener datos del proyecto
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", data.user.id)
    .single()

  if (!project) {
    redirect("/dashboard")
  }

  // Obtener TODOS los proyectos del usuario para validación de capacidad
  const { data: allProjects } = await supabase
    .from("projects")
    .select("id, name, cycle_state")
    .eq("user_id", data.user.id)

  // Obtener el área relacionada si existe
  let projectArea = null
  if (project.area_id) {
    const { data: area } = await supabase
      .from("areas")
      .select("id, name, vision_statement")
      .eq("id", project.area_id)
      .single()
    projectArea = area
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">

            {/* Botón de nueva intención Si-Entonces */}
            <IfThenTaskDialog projectId={id} projectRepresentation={project.representation}>
              <Button className="w-full py-3 text-base flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-black font-mono">
                <Plus className="h-4 w-4" />
                Nueva Intención Si-Entonces
              </Button>
            </IfThenTaskDialog>

            <TaskList
              tasks={tasks || []}
              projectId={id}
            />

          </div>

          <div className="space-y-6">
            {/* Cognitive Settings Card - with capacity validation */}
            <ProjectCognitiveSettings
              project={project}
              initialArea={projectArea}
              allProjects={allProjects || []}
            />

            <ProjectTimeSummary projectId={id} />
            <ProjectNotes projectId={id} notes={projectNotes || []} />
            <FileUpload projectId={id} files={projectFiles || []} title="Project Files" />
          </div>
        </div>
      </main>
    </div>
  )
}