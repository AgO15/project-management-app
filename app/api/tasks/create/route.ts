import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
        }

        const { title, description, priority, due_date, project_id } = await req.json();

        if (!title || !project_id) {
            return new Response(JSON.stringify({ error: "Title and project_id are required" }), { status: 400 });
        }

        const { data, error } = await supabase
            .from("tasks")
            .insert({
                title,
                description: description || null,
                priority: priority || "medium",
                due_date: due_date || null,
                project_id,
                user_id: user.id,
                status: "todo",
            })
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ task: data }), { status: 200 });

    } catch (error: any) {
        console.error("Task creation error:", error);
        return new Response(JSON.stringify({ error: "Failed to create task", details: error.message }), { status: 500 });
    }
}
