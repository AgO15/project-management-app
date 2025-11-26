import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("Error: GOOGLE_API_KEY is missing");
      return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
    }

    const { question } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), { status: 400 });
    }

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

    const { data: tasks } = await supabase
      .from("tasks")
      .select(`title, status, priority, due_date, project:projects(name)`)
      .eq("user_id", user.id);

    const context = tasks && tasks.length > 0
      ? `Here is a list of the user's tasks:\n${JSON.stringify(tasks, null, 2)}`
      : "The user currently has no tasks scheduled.";

    const todayInVenezuela = new Date().toLocaleDateString("es-VE", {
      timeZone: "America/Caracas",
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ answer: text }), { status: 200 });

  } catch (error: any) {
    console.error("Detailed Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}