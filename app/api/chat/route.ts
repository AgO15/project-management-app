import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This function creates a Supabase client that can run securely on the server
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

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // --- 1. GET THE CURRENTLY LOGGED-IN USER ---
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // --- 2. FETCH ALL TASKS FOR THAT USER, JOINING WITH PROJECT NAME ---
    // This query is now correct for your schema
    const { data: tasks, error: dbError } = await supabase
      .from('tasks')
      .select(`
        title,
        status,
        priority,
        due_date,
        project:projects ( name )
      `)
      .eq('user_id', user.id); // Only fetch tasks for the logged-in user

    console.log("Tasks fetched for user:", user.id, tasks); // For debugging

    if (dbError) {
      console.error("Supabase error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), { status: 500 });
    }

    // --- 3. PREPARE CONTEXT AND BUILD A BETTER PROMPT ---
    const context = tasks && tasks.length > 0
      ? `Here is a list of all the user's tasks in JSON format: ${JSON.stringify(tasks, null, 2)}.`
      : "The user currently has no tasks scheduled.";

    const todayInVenezuela = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/Caracas',
    });

    const prompt = `
      You are a helpful project assistant. The current date is ${todayInVenezuela}.
  Based only on the following context, answer the user's question.
  Format your answers using Markdown. For lists, use bullet points. For emphasis, use bold text.

  Context: ${context}

  Question: ${question}
`;

    // --- 4. CALL THE GEMINI AI MODEL ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ answer: text }), { status: 200 });

  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}