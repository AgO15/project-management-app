import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
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

        const { data, error } = await supabase
            .from("projects")
            .select("id, name, color, status")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("name");

        if (error) throw error;

        return new Response(JSON.stringify({ projects: data }), { status: 200 });

    } catch (error: any) {
        console.error("Projects list error:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch projects", details: error.message }), { status: 500 });
    }
}
