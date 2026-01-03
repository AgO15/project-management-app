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
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#E0E5EC' }}
    >
      {/* Header con estilo neumórfico */}
      <header
        className="sticky top-0 z-10 mx-3 sm:mx-4 mt-3 sm:mt-4 rounded-2xl"
        style={{
          backgroundColor: '#E0E5EC',
          boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.5)'
        }}
      >
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 sm:w-10 sm:h-10 p-0 rounded-xl text-[#888888] hover:text-[#444444] hover:bg-[#F0F0F3]"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <ProjectHeader project={project} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Columna principal - Tareas */}
          <div className="lg:col-span-2 space-y-4">
            {/* Botón de nueva intención Si-Entonces - Neumórfico */}
            <IfThenTaskDialog projectId={id} projectRepresentation={project.representation}>
              <Button
                className="w-full h-12 sm:h-14 text-sm sm:text-base flex items-center justify-center gap-2 rounded-2xl text-white font-medium border-0"
                style={{
                  background: 'linear-gradient(145deg, #34D399, #10B981)',
                  boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.4)'
                }}
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Nueva Intención Si-Entonces</span>
                <span className="sm:hidden">Nueva Intención</span>
              </Button>
            </IfThenTaskDialog>

            <TaskList
              tasks={tasks || []}
              projectId={id}
            />
          </div>

          {/* Columna lateral - Configuración y herramientas */}
          <div className="space-y-4 sm:space-y-6">
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