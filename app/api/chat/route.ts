import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. Validar que la API Key existe
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("Error: GOOGLE_API_KEY is missing in environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
    }

    // 2. Parsear la pregunta del usuario
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Question is required" }), { status: 400 });
    }

    // 3. Configurar Supabase
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

    // 4. Autenticación
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // 5. Obtener tareas del usuario (Contexto)
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
      console.error("Supabase error fetching tasks:", dbError);
      return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), { status: 500 });
    }

    // 6. Construir el Prompt
    const context =
      tasks && tasks.length > 0
        ? `Here is a list of the user's tasks:\n${JSON.stringify(tasks, null, 2)}`
        : "The user currently has no tasks scheduled.";

    const todayInVenezuela = new Date().toLocaleDateString("es-VE", {
      timeZone: "America/Caracas",
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });

    const prompt = `
You are a helpful project management assistant. 
Current date in Venezuela: ${todayInVenezuela}.

CONTEXT (User's Tasks):
${context}

USER QUESTION:
${question}

INSTRUCTIONS:
- Answer based ONLY on the context provided.
- Use Markdown formatting (bold, lists) for readability.
- Be concise and helpful.
`.trim();

    // 7. Llamar a Gemini (Usando la librería estable)
    const genAI = new GoogleGenerativeAI(apiKey);
    // Usamos 1.5-flash que es rápido y estable
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ answer: text }), { status: 200 });

  } catch (error: any) {
    // Este log aparecerá en el panel de Vercel si algo falla
    console.error("Detailed Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}