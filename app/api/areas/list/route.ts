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
            .from("areas")
            .select("*")
            .eq("user_id", user.id)
            .order("name", { ascending: true });

        if (error) throw error;

        return new Response(JSON.stringify({ areas: data }), { status: 200 });

    } catch (error: any) {
        console.error("Areas list error:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch areas", details: error.message }), { status: 500 });
    }
}
