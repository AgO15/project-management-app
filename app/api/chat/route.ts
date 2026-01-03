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

    const { question, conversationHistory } = await req.json();
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

    // Fetch tasks with project info
    const { data: tasks } = await supabase
      .from("tasks")
      .select(`id, title, status, priority, due_date, trigger_if, action_then, projects(name, cycle_state)`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Fetch projects
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, cycle_state, description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch today's time entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: timeEntries } = await supabase
      .from("time_entries")
      .select("duration_minutes, tasks(title)")
      .eq("user_id", user.id)
      .gte("start_time", today.toISOString())
      .not("duration_minutes", "is", null);

    // Calculate time statistics
    const totalMinutesToday = (timeEntries || []).reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
    const hoursToday = Math.floor(totalMinutesToday / 60);
    const minsToday = totalMinutesToday % 60;

    // Task statistics
    const taskStats = {
      total: (tasks || []).length,
      todo: (tasks || []).filter(t => t.status === 'todo').length,
      inProgress: (tasks || []).filter(t => t.status === 'in_progress').length,
      completed: (tasks || []).filter(t => t.status === 'completed').length,
    };

    // Format tasks for context
    const taskContext = tasks && tasks.length > 0
      ? `TAREAS DEL USUARIO (${taskStats.total} total, ${taskStats.todo} pendientes, ${taskStats.inProgress} en progreso):
${(tasks || []).slice(0, 10).map(t => {
        const projectName = (t.projects as any)?.name || 'Sin proyecto';
        const isIfThen = t.trigger_if && t.action_then;
        return `- ${t.title} [${t.status}] (${projectName})${isIfThen ? ' [Si-Entonces]' : ''}`;
      }).join('\n')}`
      : "El usuario no tiene tareas.";

    // Format projects for context  
    const projectContext = projects && projects.length > 0
      ? `PROYECTOS DEL USUARIO (${projects.length} total):
${(projects || []).map(p => `- ${p.name} [${p.cycle_state || 'sin estado'}]${p.description ? ': ' + p.description.substring(0, 50) : ''}`).join('\n')}`
      : "El usuario no tiene proyectos.";

    // Format time for context
    const timeContext = `TIEMPO HOY: ${hoursToday}h ${minsToday}m trabajados`;

    // Conversation history context (last 5 messages)
    const historyContext = conversationHistory && conversationHistory.length > 0
      ? `HISTORIAL DE CONVERSACIÓN RECIENTE:
${conversationHistory.slice(-5).map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content.substring(0, 100)}`).join('\n')}`
      : "";

    const todayInVenezuela = new Date().toLocaleDateString("es-VE", {
      timeZone: "America/Caracas",
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const prompt = `
Eres Agnys, un asistente de productividad especializado en gestión cognitiva de proyectos.
Estás basado en principios de neurociencia cognitiva (Teoría de Carver & Scheier, Modelo Transteórico de Prochaska, e Intenciones de Implementación de Gollwitzer).

FECHA ACTUAL: ${todayInVenezuela}

CONTEXTO DEL USUARIO:
${taskContext}

${projectContext}

${timeContext}

${historyContext}

PREGUNTA DEL USUARIO:
${question}

INSTRUCCIONES:
1. Responde en el mismo idioma que usó el usuario (español o inglés)
2. Sé conciso pero útil (máximo 150 palabras)
3. Usa Markdown para formato (negrita, listas)
4. Si preguntan sobre productividad, analiza sus tareas y tiempo
5. Si preguntan "¿en qué debería enfocarme?", sugiere basándote en:
   - Tareas en_progreso primero
   - Tareas con fecha límite cercana
   - Proyectos en ciclo "growth" o "introduction"
6. Si preguntan "¿cómo va mi semana/día?", da un resumen de tiempo y tareas
7. Puedes sugerir comandos del chat como "/timer [tarea]" o "/completar [tarea]"
`.trim();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ answer: text }), { status: 200 });

  } catch (error: any) {
    console.error("Detailed Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}