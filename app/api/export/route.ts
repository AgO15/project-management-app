// File: app/api/export/route.ts
// API endpoint to export all user data for AI assessment

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all user data in parallel
        const [
            { data: areas },
            { data: projects },
            { data: tasks },
            { data: timeEntries },
            { data: notes }
        ] = await Promise.all([
            supabase
                .from("areas")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),
            supabase
                .from("projects")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),
            supabase
                .from("tasks")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),
            supabase
                .from("time_entries")
                .select(`
          *,
          tasks (
            title,
            project_id,
            projects (name)
          )
        `)
                .eq("user_id", user.id)
                .order("start_time", { ascending: false }),
            supabase
                .from("notes")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
        ]);

        // Calculate summary statistics
        const totalTimeMinutes = timeEntries?.reduce((sum, entry) =>
            sum + (entry.duration_minutes || 0), 0) || 0;

        const projectStats = projects?.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};

        const taskStats = tasks?.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>) || {};

        // Build the export object
        const exportData = {
            exportedAt: new Date().toISOString(),
            summary: {
                totalAreas: areas?.length || 0,
                totalProjects: projects?.length || 0,
                totalTasks: tasks?.length || 0,
                totalTimeEntries: timeEntries?.length || 0,
                totalNotes: notes?.length || 0,
                totalTimeTracked: {
                    minutes: totalTimeMinutes,
                    hours: Math.round(totalTimeMinutes / 60 * 10) / 10,
                    formatted: `${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`
                },
                projectsByStatus: projectStats,
                tasksByStatus: taskStats
            },
            data: {
                areas: areas || [],
                projects: projects || [],
                tasks: tasks || [],
                timeEntries: timeEntries || [],
                notes: notes || []
            }
        };

        // Return as downloadable JSON
        const filename = `project-data-export-${new Date().toISOString().split('T')[0]}.json`;

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Failed to export data" },
            { status: 500 }
        );
    }
}
