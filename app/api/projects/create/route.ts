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

        const {
            name,
            description,
            color,
            // New cognitive fields
            area_id,
            cycle_state,
            representation,
            exit_criteria
        } = await req.json();

        if (!name) {
            return new Response(JSON.stringify({ error: "Project name is required" }), { status: 400 });
        }

        const { data, error } = await supabase
            .from("projects")
            .insert({
                name,
                description: description || null,
                color: color || "#22c55e", // Updated default to match cyberpunk theme
                user_id: user.id,
                status: "active",
                // New cognitive fields
                area_id: area_id || null,
                cycle_state: cycle_state || "pause",
                representation: representation || null,
                exit_criteria: exit_criteria || null,
            })
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ project: data }), { status: 200 });

    } catch (error: any) {
        console.error("Project creation error:", error);
        return new Response(JSON.stringify({ error: "Failed to create project", details: error.message }), { status: 500 });
    }
}

