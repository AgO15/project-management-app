// File: components/chat-component.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, X, MessageCircle, Send, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: 'user' | 'bot' | 'system';
  content: string;
  showProjectSelector?: boolean;
  pendingTaskTitle?: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  project_id: string;
}

// Neumorphic styles
const neuCardStyle = {
  backgroundColor: '#E0E5EC',
  boxShadow: '9px 9px 18px rgba(163, 177, 198, 0.6), -9px -9px 18px rgba(255, 255, 255, 0.5)',
};

const neuInsetStyle = {
  backgroundColor: '#E0E5EC',
  boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
};

export function ChatComponent() {
  const router = useRouter();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [pendingTaskTitle, setPendingTaskTitle] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ taskId: string; taskTitle: string; startTime: Date } | null>(null);
  const [lastMentionedTask, setLastMentionedTask] = useState<Task | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
    fetchTasks();
    // Show welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'bot',
        content: language === 'es'
          ? '👋 **¡Hola!** Soy tu asistente. Escribe `/ayuda` para ver los comandos disponibles.'
          : '👋 **Hello!** I\'m your assistant. Type `/help` to see available commands.'
      }]);
    }
  }, []);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch("/api/projects/list");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("tasks")
        .select("id, title, status, project_id")
        .eq("user_id", user.id)
        .neq("status", "completed")
        .order("created_at", { ascending: false });

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addBotMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'bot', content }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input.trim();
    const userMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // ========== COMMANDS ==========

    // /clear or /limpiar
    if (/^\/(?:clear|limpiar)$/i.test(userInput)) {
      setMessages([{
        role: 'bot',
        content: language === 'es' ? '🧹 Chat limpiado.' : '🧹 Chat cleared.'
      }]);
      setPendingTaskTitle(null);
      setSelectedProject(null);
      setLastMentionedTask(null);
      return;
    }

    // ========== CONTEXT-AWARE COMMANDS ==========

    // "completa eso" / "termina eso" / "complete that" / "finish that"
    if (/^(?:completa|termina|complete|finish)\s+(?:eso|esa|that|it)$/i.test(userInput)) {
      if (!lastMentionedTask) {
        addBotMessage(language === 'es'
          ? '❓ No hay ninguna tarea en contexto. Menciona una tarea primero.'
          : '❓ No task in context. Mention a task first.');
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        await supabase
          .from("tasks")
          .update({ status: "completed" })
          .eq("id", lastMentionedTask.id);

        addBotMessage(`✅ **${lastMentionedTask.title}** ${language === 'es' ? 'completada!' : 'completed!'}`);
        await fetchTasks();
        setLastMentionedTask(null);
        toast({ title: language === 'es' ? "Tarea completada" : "Task completed" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al completar la tarea'
          : '❌ Error completing task');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // "empieza eso" / "start that" - Start timer on last mentioned task
    if (/^(?:empieza|inicia|start|begin)\s+(?:eso|esa|that|it)$/i.test(userInput)) {
      if (!lastMentionedTask) {
        addBotMessage(language === 'es'
          ? '❓ No hay ninguna tarea en contexto. Menciona una tarea primero.'
          : '❓ No task in context. Mention a task first.');
        return;
      }

      if (activeTimer) {
        addBotMessage(language === 'es'
          ? `⚠️ Ya tienes un timer activo. Usa \`/stop\` primero.`
          : `⚠️ Timer already active. Use \`/stop\` first.`);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        await supabase.from("time_entries").insert({
          task_id: lastMentionedTask.id,
          user_id: user.id,
          start_time: new Date().toISOString(),
          description: language === 'es' ? 'Desde chat (contexto)' : 'From chat (context)',
        });

        setActiveTimer({
          taskId: lastMentionedTask.id,
          taskTitle: lastMentionedTask.title,
          startTime: new Date()
        });

        addBotMessage(`▶️ ${language === 'es' ? 'Timer iniciado en' : 'Timer started on'} **${lastMentionedTask.title}**`);
        toast({ title: language === 'es' ? "Timer iniciado" : "Timer started" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al iniciar el timer'
          : '❌ Error starting timer');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // ========== NATURAL LANGUAGE PATTERNS ==========

    // "necesito [hacer algo]" / "tengo que [hacer algo]" / "I need to [do something]"
    const needToMatch = userInput.match(/^(?:necesito|tengo que|debo|i need to|i have to|i must)\s+(.+)$/i);
    if (needToMatch) {
      const taskTitle = needToMatch[1].trim();
      const systemMessage: Message = {
        role: 'system',
        content: `${language === 'es' ? 'Creando tarea' : 'Creating task'}: **${taskTitle}**\n\n${language === 'es' ? 'Selecciona un proyecto:' : 'Select a project:'}`,
        showProjectSelector: true,
        pendingTaskTitle: taskTitle
      };
      setMessages(prev => [...prev, systemMessage]);
      setPendingTaskTitle(taskTitle);
      return;
    }

    // "¿cuánto tiempo llevo hoy?" / "how much time today?"
    if (/^(?:¿?cuánto tiempo|how much time|tiempo hoy|time today)/i.test(userInput)) {
      // Trigger /tiempo command
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: entries } = await supabase
          .from("time_entries")
          .select("duration_minutes")
          .eq("user_id", user.id)
          .gte("start_time", today.toISOString())
          .not("duration_minutes", "is", null);

        const totalMinutes = (entries || []).reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        addBotMessage(`⏱️ **${language === 'es' ? 'Tiempo Hoy' : 'Time Today'}:** ${hours}h ${mins}m`);
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al obtener el tiempo'
          : '❌ Error getting time');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // "¿qué tareas tengo?" / "what tasks do I have?" / "mis tareas" / "ver tareas"
    if (/^(?:¿?qué tareas|¿?cuáles son mis tareas|what tasks|my tasks|show tasks|mis tareas|ver tareas|muestra(?:me)? (?:las )?tareas)/i.test(userInput)) {
      await fetchTasks();
      if (tasks.length === 0) {
        addBotMessage(language === 'es'
          ? '✅ ¡No tienes tareas pendientes!'
          : '✅ No pending tasks!');
      } else {
        const taskList = tasks.slice(0, 5).map((t, i) => {
          const statusIcon = t.status === 'in_progress' ? '🔄' : '⬜';
          if (i === 0) setLastMentionedTask(t); // Track first task as context
          return `${statusIcon} ${t.title}`;
        }).join('\n');
        addBotMessage(`📋 **${language === 'es' ? 'Tus tareas' : 'Your tasks'}:**\n\n${taskList}${tasks.length > 5 ? `\n\n...${language === 'es' ? 'y ' : 'and '}${tasks.length - 5} ${language === 'es' ? 'más' : 'more'}` : ''}\n\n💡 ${language === 'es' ? 'Escribe "completa eso" para completar la primera.' : 'Type "complete that" to complete the first one.'}`);
      }
      return;
    }

    // "ver proyectos" / "mis proyectos" / "show projects" / "muéstrame los proyectos"
    if (/^(?:ver(?: mis)? proyectos|mis proyectos|show(?: my)? projects|my projects|muéstra(?:me)?(?: los)? proyectos|proyectos)/i.test(userInput)) {
      await fetchProjects();
      if (projects.length === 0) {
        addBotMessage(language === 'es'
          ? '📁 No tienes proyectos aún. Crea uno con "crear proyecto [nombre]"'
          : '📁 No projects yet. Create one with "create project [name]"');
      } else {
        const projectList = projects.map(p => `- **${p.name}**`).join('\n');
        addBotMessage(`📁 **${language === 'es' ? 'Tus Proyectos' : 'Your Projects'}:**\n\n${projectList}`);
      }
      return;
    }

    // "detener" / "para" / "stop" / "parar timer" / "detén el timer"
    if (/^(?:detener|para(?:r)?|stop|detén(?:lo)?|parar(?: el)? timer|detener(?: el)? timer|stop timer)$/i.test(userInput)) {
      if (!activeTimer) {
        addBotMessage(language === 'es'
          ? '⚠️ No hay timer activo.'
          : '⚠️ No active timer.');
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const endTime = new Date();
        const durationMinutes = Math.round((endTime.getTime() - activeTimer.startTime.getTime()) / 60000);

        await supabase
          .from("time_entries")
          .update({
            end_time: endTime.toISOString(),
            duration_minutes: durationMinutes
          })
          .eq("task_id", activeTimer.taskId)
          .eq("user_id", user.id)
          .is("end_time", null);

        addBotMessage(`⏹️ ${language === 'es' ? 'Timer detenido' : 'Timer stopped'}: **${activeTimer.taskTitle}**\n\n${language === 'es' ? 'Duración:' : 'Duration:'} ${durationMinutes} ${language === 'es' ? 'minutos' : 'minutes'}`);
        setActiveTimer(null);
        toast({ title: language === 'es' ? "Timer detenido" : "Timer stopped" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al detener el timer'
          : '❌ Error stopping timer');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // "completar [tarea]" / "terminar [tarea]" / "complete [task]" / "finish [task]"
    const naturalCompleteMatch = userInput.match(/^(?:completar|terminar|complete|finish|marca(?:r)?(?: como)? completad[ao])\s+(.+)$/i);
    if (naturalCompleteMatch) {
      const taskName = naturalCompleteMatch[1].toLowerCase();
      const matchedTask = tasks.find(t => t.title.toLowerCase().includes(taskName));

      if (!matchedTask) {
        addBotMessage(language === 'es'
          ? `❌ No encontré una tarea que contenga "${naturalCompleteMatch[1]}"`
          : `❌ Couldn't find a task containing "${naturalCompleteMatch[1]}"`);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        await supabase
          .from("tasks")
          .update({ status: "completed" })
          .eq("id", matchedTask.id);

        addBotMessage(`✅ **${matchedTask.title}** ${language === 'es' ? 'completada!' : 'completed!'}`);
        await fetchTasks();
        toast({ title: language === 'es' ? "Tarea completada" : "Task completed" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al completar la tarea'
          : '❌ Error completing task');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // "empieza [tarea]" / "inicia [tarea]" / "start [task]" / "comenzar timer en [tarea]"
    const naturalTimerMatch = userInput.match(/^(?:empieza|inicia|start|comenzar|empezar)(?: timer)?(?: en| con)?\s+(.+)$/i);
    if (naturalTimerMatch) {
      const taskName = naturalTimerMatch[1].toLowerCase();
      const matchedTask = tasks.find(t => t.title.toLowerCase().includes(taskName));

      if (!matchedTask) {
        addBotMessage(language === 'es'
          ? `❌ No encontré una tarea que contenga "${naturalTimerMatch[1]}"`
          : `❌ Couldn't find a task containing "${naturalTimerMatch[1]}"`);
        return;
      }

      if (activeTimer) {
        addBotMessage(language === 'es'
          ? `⚠️ Ya tienes un timer activo en "${activeTimer.taskTitle}". Escribe "detener" primero.`
          : `⚠️ Timer already active on "${activeTimer.taskTitle}". Say "stop" first.`);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        await supabase.from("time_entries").insert({
          task_id: matchedTask.id,
          user_id: user.id,
          start_time: new Date().toISOString(),
          description: language === 'es' ? 'Desde chat' : 'From chat',
        });

        setActiveTimer({
          taskId: matchedTask.id,
          taskTitle: matchedTask.title,
          startTime: new Date()
        });

        addBotMessage(`▶️ ${language === 'es' ? 'Timer iniciado en' : 'Timer started on'} **${matchedTask.title}**\n\n${language === 'es' ? 'Escribe "detener" para parar.' : 'Say "stop" to end.'}`);
        toast({ title: language === 'es' ? "Timer iniciado" : "Timer started" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al iniciar el timer'
          : '❌ Error starting timer');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // "ir a [proyecto]" / "abrir [proyecto]" / "go to [project]" / "open [project]"
    const naturalGoMatch = userInput.match(/^(?:ir a|abrir|abre|go to|open|ve a|llévame a)\s+(.+)$/i);
    if (naturalGoMatch) {
      const projectName = naturalGoMatch[1].toLowerCase();
      const matchedProject = projects.find(p => p.name.toLowerCase().includes(projectName));

      if (!matchedProject) {
        addBotMessage(language === 'es'
          ? `❌ No encontré un proyecto que contenga "${naturalGoMatch[1]}"`
          : `❌ Couldn't find a project containing "${naturalGoMatch[1]}"`);
        return;
      }

      addBotMessage(`🚀 ${language === 'es' ? 'Navegando a' : 'Navigating to'} **${matchedProject.name}**...`);
      setTimeout(() => {
        router.push(`/projects/${matchedProject.id}`);
      }, 500);
      return;
    }

    // "crear proyecto [nombre]" / "create project [name]" / "nuevo proyecto [nombre]"
    const naturalCreateProjectMatch = userInput.match(/^(?:crear proyecto|create project|nuevo proyecto|new project)\s+(.+)$/i);
    if (naturalCreateProjectMatch) {
      const projectName = naturalCreateProjectMatch[1].trim();
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: projectName }),
        });

        if (!response.ok) throw new Error('Failed to create project');

        const data = await response.json();
        addBotMessage(`✅ **${language === 'es' ? 'Proyecto creado' : 'Project created'}!**\n\n${language === 'es' ? 'Nombre:' : 'Name:'} **${data.project.name}**`);
        await fetchProjects();
        toast({ title: language === 'es' ? "Proyecto creado" : "Project created" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al crear el proyecto'
          : '❌ Error creating project');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // "ayuda" / "help" / "qué puedo hacer" / "comandos"
    if (/^(?:ayuda|help|¿?qué puedo (?:hacer|decir)|comandos|what can (?:i|you) do|commands)$/i.test(userInput)) {
      const helpContent = language === 'es'
        ? `**📋 Comandos Disponibles:**

**Proyectos:**
- \`/proyectos\` - Listar todos los proyectos
- \`/ir [nombre]\` - Ir a un proyecto

**Tareas:**
- \`/tareas\` - Listar tareas pendientes
- \`/completar [nombre]\` - Completar una tarea
- \`/task [título]\` - Crear nueva tarea

**Tiempo:**
- \`/tiempo\` - Ver tiempo registrado hoy
- \`/timer [tarea]\` - Iniciar timer
- \`/stop\` - Detener timer

**Chat:**
- \`/limpiar\` - Limpiar historial
- \`/ayuda\` - Mostrar esta ayuda`
        : `**📋 Available Commands:**

**Projects:**
- \`/projects\` - List all projects
- \`/go [name]\` - Go to a project

**Tasks:**
- \`/tasks\` - List pending tasks
- \`/complete [name]\` - Complete a task
- \`/task [title]\` - Create new task

**Time:**
- \`/time\` - Show today's tracked time
- \`/timer [task]\` - Start timer
- \`/stop\` - Stop timer

**Chat:**
- \`/clear\` - Clear history
- \`/help\` - Show this help`;
      addBotMessage(helpContent);
      return;
    }

    // /proyectos or /projects
    if (/^\/(?:proyectos|projects)$/i.test(userInput)) {
      await fetchProjects();
      if (projects.length === 0) {
        addBotMessage(language === 'es'
          ? '📁 No tienes proyectos aún. Crea uno con `/create project [nombre]`'
          : '📁 No projects yet. Create one with `/create project [name]`');
      } else {
        const projectList = projects.map(p => `- **${p.name}**`).join('\n');
        addBotMessage(`📁 **${language === 'es' ? 'Tus Proyectos' : 'Your Projects'}:**\n\n${projectList}`);
      }
      return;
    }

    // /tareas or /tasks
    if (/^\/(?:tareas|tasks)$/i.test(userInput)) {
      await fetchTasks();
      if (tasks.length === 0) {
        addBotMessage(language === 'es'
          ? '✅ ¡No tienes tareas pendientes!'
          : '✅ No pending tasks!');
      } else {
        const taskList = tasks.slice(0, 10).map(t => {
          const statusIcon = t.status === 'in_progress' ? '🔄' : '⬜';
          return `${statusIcon} ${t.title}`;
        }).join('\n');
        addBotMessage(`📋 **${language === 'es' ? 'Tareas Pendientes' : 'Pending Tasks'}:**\n\n${taskList}${tasks.length > 10 ? `\n\n...${language === 'es' ? 'y ' : 'and '}${tasks.length - 10} ${language === 'es' ? 'más' : 'more'}` : ''}`);
      }
      return;
    }

    // /completar [nombre] or /complete [name]
    const completeMatch = userInput.match(/^\/(?:completar|complete)\s+(.+)$/i);
    if (completeMatch) {
      const taskName = completeMatch[1].toLowerCase();
      const matchedTask = tasks.find(t => t.title.toLowerCase().includes(taskName));

      if (!matchedTask) {
        addBotMessage(language === 'es'
          ? `❌ No encontré una tarea que contenga "${taskName}"`
          : `❌ Couldn't find a task containing "${taskName}"`);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        await supabase
          .from("tasks")
          .update({ status: "completed" })
          .eq("id", matchedTask.id);

        addBotMessage(`✅ **${matchedTask.title}** ${language === 'es' ? 'completada!' : 'completed!'}`);
        await fetchTasks();
        toast({ title: language === 'es' ? "Tarea completada" : "Task completed" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al completar la tarea'
          : '❌ Error completing task');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // /estado [tarea] [estado] or /status [task] [status]
    const statusMatch = userInput.match(/^\/(?:estado|status)\s+(.+?)\s+(todo|progreso|in_progress|pendiente)$/i);
    if (statusMatch) {
      const taskName = statusMatch[1].toLowerCase();
      const newStatusInput = statusMatch[2].toLowerCase();
      const matchedTask = tasks.find(t => t.title.toLowerCase().includes(taskName));

      if (!matchedTask) {
        addBotMessage(language === 'es'
          ? `❌ No encontré una tarea que contenga "${taskName}"`
          : `❌ Couldn't find a task containing "${taskName}"`);
        return;
      }

      // Map status input to actual status
      const statusMap: Record<string, string> = {
        'todo': 'todo',
        'pendiente': 'todo',
        'progreso': 'in_progress',
        'in_progress': 'in_progress'
      };
      const newStatus = statusMap[newStatusInput] || 'todo';
      const statusLabel = newStatus === 'in_progress'
        ? (language === 'es' ? 'En Progreso' : 'In Progress')
        : (language === 'es' ? 'Por Hacer' : 'To Do');

      setIsLoading(true);
      try {
        const supabase = createClient();
        await supabase
          .from("tasks")
          .update({ status: newStatus })
          .eq("id", matchedTask.id);

        addBotMessage(`🔄 **${matchedTask.title}** → ${statusLabel}`);
        await fetchTasks();
        toast({ title: language === 'es' ? "Estado actualizado" : "Status updated" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al cambiar el estado'
          : '❌ Error changing status');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // /si [trigger] entonces [acción] - Create If-Then task
    const ifThenMatch = userInput.match(/^\/si\s+(.+?)\s+entonces\s+(.+)$/i);
    if (ifThenMatch) {
      const triggerIf = ifThenMatch[1].trim();
      const actionThen = ifThenMatch[2].trim();
      const fullTitle = `Si ${triggerIf} → ${actionThen}`;

      // Store the if-then data and show project selector
      const systemMessage: Message = {
        role: 'system',
        content: `${language === 'es' ? 'Creando intención Si-Entonces:' : 'Creating If-Then intention:'}\n\n**Si:** ${triggerIf}\n**Entonces:** ${actionThen}\n\n${language === 'es' ? 'Selecciona un proyecto:' : 'Select a project:'}`,
        showProjectSelector: true,
        pendingTaskTitle: fullTitle
      };
      setMessages(prev => [...prev, systemMessage]);
      setPendingTaskTitle(fullTitle);
      // Store the trigger/action for later
      setTaskDescription(`trigger_if:${triggerIf}|action_then:${actionThen}`);
      return;
    }

    // /ir [proyecto] or /go [project]
    const goMatch = userInput.match(/^\/(?:ir|go)\s+(.+)$/i);
    if (goMatch) {
      const projectName = goMatch[1].toLowerCase();
      const matchedProject = projects.find(p => p.name.toLowerCase().includes(projectName));

      if (!matchedProject) {
        addBotMessage(language === 'es'
          ? `❌ No encontré un proyecto que contenga "${projectName}"`
          : `❌ Couldn't find a project containing "${projectName}"`);
        return;
      }

      addBotMessage(`🚀 ${language === 'es' ? 'Navegando a' : 'Navigating to'} **${matchedProject.name}**...`);
      setTimeout(() => {
        router.push(`/projects/${matchedProject.id}`);
      }, 500);
      return;
    }

    // /tiempo or /time
    if (/^\/(?:tiempo|time)$/i.test(userInput)) {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: entries } = await supabase
          .from("time_entries")
          .select("duration_minutes, tasks(title)")
          .eq("user_id", user.id)
          .gte("start_time", today.toISOString())
          .not("duration_minutes", "is", null);

        const totalMinutes = (entries || []).reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;

        addBotMessage(`⏱️ **${language === 'es' ? 'Tiempo Hoy' : 'Time Today'}:** ${hours}h ${mins}m\n\n${language === 'es' ? 'Entradas:' : 'Entries:'} ${(entries || []).length}`);
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al obtener el tiempo'
          : '❌ Error getting time');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // /timer [tarea]
    const timerMatch = userInput.match(/^\/timer\s+(.+)$/i);
    if (timerMatch) {
      const taskName = timerMatch[1].toLowerCase();
      const matchedTask = tasks.find(t => t.title.toLowerCase().includes(taskName));

      if (!matchedTask) {
        addBotMessage(language === 'es'
          ? `❌ No encontré una tarea que contenga "${taskName}"`
          : `❌ Couldn't find a task containing "${taskName}"`);
        return;
      }

      if (activeTimer) {
        addBotMessage(language === 'es'
          ? `⚠️ Ya tienes un timer activo en "${activeTimer.taskTitle}". Usa \`/stop\` primero.`
          : `⚠️ Timer already active on "${activeTimer.taskTitle}". Use \`/stop\` first.`);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        await supabase.from("time_entries").insert({
          task_id: matchedTask.id,
          user_id: user.id,
          start_time: new Date().toISOString(),
          description: language === 'es' ? 'Desde chat' : 'From chat',
        });

        setActiveTimer({
          taskId: matchedTask.id,
          taskTitle: matchedTask.title,
          startTime: new Date()
        });

        addBotMessage(`▶️ ${language === 'es' ? 'Timer iniciado en' : 'Timer started on'} **${matchedTask.title}**\n\n${language === 'es' ? 'Usa `/stop` para detener.' : 'Use `/stop` to stop.'}`);
        toast({ title: language === 'es' ? "Timer iniciado" : "Timer started" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al iniciar el timer'
          : '❌ Error starting timer');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // /stop
    if (/^\/stop$/i.test(userInput)) {
      if (!activeTimer) {
        addBotMessage(language === 'es'
          ? '⚠️ No hay timer activo.'
          : '⚠️ No active timer.');
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const endTime = new Date();
        const durationMinutes = Math.round((endTime.getTime() - activeTimer.startTime.getTime()) / 60000);

        await supabase
          .from("time_entries")
          .update({
            end_time: endTime.toISOString(),
            duration_minutes: durationMinutes
          })
          .eq("task_id", activeTimer.taskId)
          .eq("user_id", user.id)
          .is("end_time", null);

        addBotMessage(`⏹️ ${language === 'es' ? 'Timer detenido' : 'Timer stopped'}: **${activeTimer.taskTitle}**\n\n${language === 'es' ? 'Duración:' : 'Duration:'} ${durationMinutes} ${language === 'es' ? 'minutos' : 'minutes'}`);
        setActiveTimer(null);
        toast({ title: language === 'es' ? "Timer detenido" : "Timer stopped" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al detener el timer'
          : '❌ Error stopping timer');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // /task [title] - Create task
    const taskCommandMatch = userInput.match(/^\/task\s+(.+)$/i);
    if (taskCommandMatch) {
      const taskTitle = taskCommandMatch[1].trim();
      const systemMessage: Message = {
        role: 'system',
        content: `${language === 'es' ? 'Creando tarea' : 'Creating task'}: **${taskTitle}**\n\n${language === 'es' ? 'Selecciona un proyecto:' : 'Select a project:'}`,
        showProjectSelector: true,
        pendingTaskTitle: taskTitle
      };
      setMessages(prev => [...prev, systemMessage]);
      setPendingTaskTitle(taskTitle);
      return;
    }

    // "crear tarea [title]" - Natural language
    const naturalTaskMatch = userInput.match(/^crear tarea\s+(.+)$/i);
    if (naturalTaskMatch) {
      const taskTitle = naturalTaskMatch[1].trim();
      const systemMessage: Message = {
        role: 'system',
        content: `Creando tarea: **${taskTitle}**\n\nSelecciona un proyecto:`,
        showProjectSelector: true,
        pendingTaskTitle: taskTitle
      };
      setMessages(prev => [...prev, systemMessage]);
      setPendingTaskTitle(taskTitle);
      return;
    }

    // /create project [name]
    const createProjectMatch = userInput.match(/^\/create project\s+(.+)$/i);
    if (createProjectMatch) {
      const projectName = createProjectMatch[1].trim();
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: projectName }),
        });

        if (!response.ok) throw new Error('Failed to create project');

        const data = await response.json();
        addBotMessage(`✅ **${language === 'es' ? 'Proyecto creado' : 'Project created'}!**\n\n${language === 'es' ? 'Nombre:' : 'Name:'} **${data.project.name}**`);
        await fetchProjects();
        toast({ title: language === 'es' ? "Proyecto creado" : "Project created" });
      } catch (error) {
        addBotMessage(language === 'es'
          ? '❌ Error al crear el proyecto'
          : '❌ Error creating project');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Regular chat message - send to AI with conversation context
    setIsLoading(true);
    try {
      // Prepare conversation history for context (last 6 messages)
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content.substring(0, 200) // Truncate for token efficiency
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userInput,
          conversationHistory
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      addBotMessage(data.answer);
    } catch (error) {
      addBotMessage(language === 'es'
        ? '❌ Lo siento, tuve un problema al procesar tu mensaje.'
        : '❌ Sorry, I had trouble processing your message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!pendingTaskTitle || !selectedProject) return;

    setIsLoading(true);
    try {
      // Check if this is an If-Then task
      let triggerIf: string | undefined;
      let actionThen: string | undefined;
      let finalDescription = taskDescription.trim() || undefined;

      if (taskDescription.startsWith('trigger_if:')) {
        const parts = taskDescription.split('|');
        triggerIf = parts[0]?.replace('trigger_if:', '').trim();
        actionThen = parts[1]?.replace('action_then:', '').trim();
        finalDescription = undefined; // Clear description, it was just for passing data
      }

      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pendingTaskTitle,
          description: finalDescription,
          priority: taskPriority,
          due_date: taskDueDate ? taskDueDate.toISOString() : undefined,
          project_id: selectedProject.id,
          trigger_if: triggerIf,
          action_then: actionThen,
          is_micro_objective: !!triggerIf,
        }),
      });

      if (!response.ok) throw new Error('Failed to create task');

      const data = await response.json();

      const isIfThen = !!triggerIf;
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.showProjectSelector);
        return [
          ...filtered,
          {
            role: 'bot',
            content: isIfThen
              ? `✅ **${language === 'es' ? 'Intención Si-Entonces creada' : 'If-Then intention created'}!**\n\n**Si:** ${triggerIf}\n**Entonces:** ${actionThen}\n**${language === 'es' ? 'Proyecto' : 'Project'}:** ${selectedProject.name}`
              : `✅ **${language === 'es' ? 'Tarea creada' : 'Task created'}!**\n\n${language === 'es' ? 'Título:' : 'Title:'} **${data.task.title}**\n${language === 'es' ? 'Proyecto:' : 'Project:'} **${selectedProject.name}**`
          }
        ];
      });

      setPendingTaskTitle(null);
      setSelectedProject(null);
      setTaskDescription("");
      setTaskPriority("medium");
      setTaskDueDate(undefined);

      toast({ title: language === 'es' ? (isIfThen ? "Intención creada" : "Tarea creada") : (isIfThen ? "Intention created" : "Task created") });
      await fetchTasks();
    } catch (error) {
      toast({
        title: "Error",
        description: language === 'es' ? "Error al crear la tarea" : "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTaskCreation = () => {
    setMessages(prev => prev.filter(msg => !msg.showProjectSelector));
    setPendingTaskTitle(null);
    setSelectedProject(null);
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskDueDate(undefined);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden" style={neuCardStyle}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
            boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
          }}
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#444444]">
            {language === 'es' ? 'Asistente' : 'Assistant'}
          </h3>
          <p className="text-xs text-[#888888]">
            {activeTimer
              ? `⏱️ ${language === 'es' ? 'Timer activo:' : 'Active timer:'} ${activeTimer.taskTitle}`
              : language === 'es' ? 'Escribe /ayuda' : 'Type /help'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="h-80 overflow-y-auto p-4 mx-4 rounded-2xl"
        style={neuInsetStyle}
      >
        <div className="space-y-3">
          {messages.map((msg, index) => (
            <div key={index}>
              {msg.showProjectSelector ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="prose prose-sm dark:prose-invert px-3 py-2 rounded-xl bg-[#F0F0F3] max-w-[80%]">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Project Selection */}
                  <div className="bg-[#F0F0F3] rounded-2xl p-4 space-y-3" style={{ boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.5)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-[#888888] uppercase">
                        {language === 'es' ? 'Seleccionar proyecto' : 'Select project'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelTaskCreation}
                        className="h-6 w-6 p-0 text-[#888888]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {isLoadingProjects ? (
                      <p className="text-xs text-[#888888]">Loading...</p>
                    ) : projects.length === 0 ? (
                      <p className="text-xs text-[#888888]">{language === 'es' ? 'No hay proyectos' : 'No projects'}</p>
                    ) : (
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {projects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className={cn(
                              "w-full flex items-center gap-2 p-2 rounded-xl text-left text-sm transition-all",
                              selectedProject?.id === project.id
                                ? "bg-[#E0E5EC] text-[#444444]"
                                : "hover:bg-[#E8E8EB] text-[#666666]"
                            )}
                            style={selectedProject?.id === project.id ? {
                              boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.6)'
                            } : {}}
                          >
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: project.color }} />
                            {project.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={handleCreateTask}
                      disabled={!selectedProject || isLoading}
                      className="w-full rounded-xl text-white border-0"
                      style={{
                        background: selectedProject ? 'linear-gradient(145deg, #34D399, #10B981)' : '#9CA3AF',
                        boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {language === 'es' ? 'Crear Tarea' : 'Create Task'}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className={cn(
                  "flex",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  <div className={cn(
                    "prose prose-sm max-w-[80%] px-3 py-2 rounded-xl",
                    msg.role === 'user'
                      ? "text-white rounded-br-sm"
                      : "bg-[#F0F0F3] text-[#444444] rounded-bl-sm"
                  )} style={msg.role === 'user' ? {
                    background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)'
                  } : {}}>
                    {msg.role === 'bot' || msg.role === 'system' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && !pendingTaskTitle && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-xl bg-[#F0F0F3] text-[#888888] text-sm flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {language === 'es' ? 'Pensando...' : 'Thinking...'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="px-4 pb-2 flex flex-wrap gap-2">
        {!pendingTaskTitle && (
          <>
            <button
              onClick={() => setInput('/tareas')}
              className="text-xs px-3 py-1.5 rounded-xl text-[#666666] transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#F0F0F3',
                boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.5)'
              }}
            >
              📋 {language === 'es' ? 'Tareas' : 'Tasks'}
            </button>
            <button
              onClick={() => setInput('/tiempo')}
              className="text-xs px-3 py-1.5 rounded-xl text-[#666666] transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#F0F0F3',
                boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.5)'
              }}
            >
              ⏱️ {language === 'es' ? 'Tiempo' : 'Time'}
            </button>
            <button
              onClick={() => setInput('/proyectos')}
              className="text-xs px-3 py-1.5 rounded-xl text-[#666666] transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#F0F0F3',
                boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.5)'
              }}
            >
              📁 {language === 'es' ? 'Proyectos' : 'Projects'}
            </button>
            {activeTimer && (
              <button
                onClick={() => setInput('/stop')}
                className="text-xs px-3 py-1.5 rounded-xl text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(145deg, #F87171, #EF4444)',
                  boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.5)'
                }}
              >
                ⏹️ {language === 'es' ? 'Detener' : 'Stop'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {(input.startsWith('/timer ') || input.startsWith('/completar ') || input.startsWith('/complete ') || input.startsWith('/ir ') || input.startsWith('/go ')) && (
        <div className="px-4 pb-2">
          <div
            className="rounded-xl p-2 max-h-32 overflow-y-auto space-y-1"
            style={{
              backgroundColor: '#F0F0F3',
              boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
            }}
          >
            {(input.startsWith('/timer ') || input.startsWith('/completar ') || input.startsWith('/complete ')) ? (
              // Show tasks
              tasks.length === 0 ? (
                <p className="text-xs text-[#888888] px-2">{language === 'es' ? 'No hay tareas' : 'No tasks'}</p>
              ) : (
                tasks.slice(0, 5).map(task => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      const cmd = input.split(' ')[0];
                      setInput(`${cmd} ${task.title}`);
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-[#444444] hover:bg-[#E0E5EC] transition-colors truncate"
                  >
                    {task.status === 'in_progress' ? '🔄' : '⬜'} {task.title}
                  </button>
                ))
              )
            ) : (
              // Show projects
              projects.length === 0 ? (
                <p className="text-xs text-[#888888] px-2">{language === 'es' ? 'No hay proyectos' : 'No projects'}</p>
              ) : (
                projects.slice(0, 5).map(project => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      const cmd = input.split(' ')[0];
                      setInput(`${cmd} ${project.name}`);
                    }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-[#444444] hover:bg-[#E0E5EC] transition-colors flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded" style={{ backgroundColor: project.color }} />
                    {project.name}
                  </button>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 pt-2 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === 'es' ? "/ayuda para ver comandos..." : "/help for commands..."}
          disabled={isLoading}
          className="flex-1 rounded-xl border-0 text-[#444444] placeholder:text-[#AAAAAA]"
          style={neuInsetStyle}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-xl w-10 h-10 p-0 text-white border-0"
          style={{
            background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
            boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.4)'
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}