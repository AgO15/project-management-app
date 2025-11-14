import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// --- 1) Supabase server client (SSR-safe) ---
function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
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
}

// --- 2) Gemini client ---
// Usamos la variable de entorno si existe, si no, usamos un modelo REAL (1.5-flash)
const GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL || "gemini-1.5-flash"; 
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Question is required" }), { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // --- 3) Auth ---
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      console.error("Supabase auth error:", userErr);
      return new Response(JSON.stringify({ error: "Auth error" }), { status: 500 });
    }
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // --- 4) Query tasks ---
    const { data: tasks, error: dbError } = await supabase
      .from("tasks")
      .select(`
        title,
        status,
        priority,
        due_date,
        project:projects ( name )
      `)
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Supabase error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), { status: 500 });
    }

    // --- 5) Build prompt/context ---
    const context =
      tasks && tasks.length > 0
        ? `Here is a list of all the user's tasks in JSON format:\n${JSON.stringify(tasks, null, 2)}`
        : "The user currently has no tasks scheduled.";

    const todayInVenezuela = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Caracas",
    });

    const prompt = `
You are a helpful project assistant. The current date is ${todayInVenezuela}.
Based only on the following context, answer the user's question.
Format your answers using Markdown. For lists, use bullet points. For emphasis, use **bold**.

Context:
${context}

Question:
${question}
`.trim();

    // --- 6) Call Gemini ---
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = result.text ?? "";

    if (!text) {
      return new Response(JSON.stringify({ error: "Empty response from model" }), { status: 502 });
    }

    return new Response(JSON.stringify({ answer: text }), { status: 200 });
  } catch (error) {
    console.error("[error] API error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}