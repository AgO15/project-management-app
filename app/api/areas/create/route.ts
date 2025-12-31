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

        const { name, vision_statement } = await req.json();

        if (!name) {
            return new Response(JSON.stringify({ error: "Area name is required" }), { status: 400 });
        }

        const { data, error } = await supabase
            .from("areas")
            .insert({
                name,
                vision_statement: vision_statement || null,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ area: data }), { status: 200 });

    } catch (error: any) {
        console.error("Area creation error:", error);
        return new Response(JSON.stringify({ error: "Failed to create area", details: error.message }), { status: 500 });
    }
}
