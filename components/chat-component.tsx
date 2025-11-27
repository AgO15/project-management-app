// File: components/chat-component.tsx

"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [pendingTaskTitle, setPendingTaskTitle] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Local Commands
    if (input.trim().toLowerCase() === '/clear') {
      setMessages([]);
      setInput("");
      setPendingTaskTitle(null);
      setSelectedProject(null);
      return;
    }

    if (input.trim().toLowerCase() === '/help') {
      const helpMessage: Message = {
        role: 'bot',
        content: "**Available Commands:**\\n- `/clear`: Clear chat history.\\n- `/help`: Show this help message.\\n- `/task [task name]`: Create a new task.\\n- `/create project [project name]`: Create a new project.\\n- **Natural Language**: \"crear tarea [task name]\""
      };
      setMessages((prev) => [...prev, { role: 'user', content: input }, helpMessage]);
      setInput("");
      return;
    }

    // Task Creation Detection - /task command
    const taskCommandMatch = input.match(/^\/task\s+(.+)$/i);
    if (taskCommandMatch) {
      const taskTitle = taskCommandMatch[1].trim();
      const userMessage: Message = { role: 'user', content: input };
      const systemMessage: Message = {
        role: 'system',
        content: `Creating task: **${taskTitle}**\\n\\nPlease select a project and fill in the details:`,
        showProjectSelector: true,
        pendingTaskTitle: taskTitle
      };
      setMessages((prev) => [...prev, userMessage, systemMessage]);
      setPendingTaskTitle(taskTitle);
      setInput("");
      return;
    }

    // Task Creation Detection - Natural language "crear tarea [title]"
    const naturalTaskMatch = input.match(/^crear tarea\s+(.+)$/i);
    if (naturalTaskMatch) {
      const taskTitle = naturalTaskMatch[1].trim();
      const userMessage: Message = { role: 'user', content: input };
      const systemMessage: Message = {
        role: 'system',
        content: `Creating task: **${taskTitle}**\\n\\nPlease select a project and fill in the details:`,
        showProjectSelector: true,
        pendingTaskTitle: taskTitle
      };
      setMessages((prev) => [...prev, userMessage, systemMessage]);
      setPendingTaskTitle(taskTitle);
      setInput("");
      return;
    }

    // Project Creation Command
    const createProjectMatch = input.match(/^\/create project\s+(.+)$/i);
    if (createProjectMatch) {
      const projectName = createProjectMatch[1].trim();
      const userMessage: Message = { role: 'user', content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      setIsLoading(true);
      try {
        const response = await fetch('/api/projects/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: projectName }),
        });

        if (!response.ok) throw new Error('Failed to create project');

        const data = await response.json();
        const botMessage: Message = {
          role: 'bot',
          content: `✅ **Project created successfully!**\\n\\nProject: **${data.project.name}**\\n\\nYou can now create tasks using \`/task [task name]\``
        };
        setMessages((prev) => [...prev, botMessage]);

        // Refresh projects list
        await fetchProjects();

        toast({
          title: "Project created",
          description: `${data.project.name} has been created successfully.`,
        });
      } catch (error) {
        const errorMessage: Message = {
          role: 'bot',
          content: '❌ Sorry, I had trouble creating that project. Please try again.'
        };
        setMessages((prev) => [...prev, errorMessage]);
        console.error("Project creation error:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Regular chat message
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const botMessage: Message = { role: 'bot', content: data.answer };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      const errorMessage: Message = { role: 'bot', content: 'Sorry, I had trouble answering that.' };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!pendingTaskTitle || !selectedProject) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pendingTaskTitle,
          description: taskDescription.trim() || undefined,
          priority: taskPriority,
          due_date: taskDueDate ? taskDueDate.toISOString() : undefined,
          project_id: selectedProject.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create task');

      const data = await response.json();

      // Remove project selector and add confirmation
      setMessages((prev) => {
        const filtered = prev.filter(msg => !msg.showProjectSelector);
        return [
          ...filtered,
          {
            role: 'bot',
            content: `✅ **Task created successfully!**\\n\\nTask: **${data.task.title}**\\nProject: **${selectedProject.name}**\\nPriority: ${data.task.priority}\\nStatus: ${data.task.status}`
          }
        ];
      });

      // Reset state
      setPendingTaskTitle(null);
      setSelectedProject(null);
      setTaskDescription("");
      setTaskPriority("medium");
      setTaskDueDate(undefined);

      toast({
        title: "Task created",
        description: `${data.task.title} has been created in ${selectedProject.name}.`,
      });
    } catch (error) {
      console.error("Task creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTaskCreation = () => {
    setMessages((prev) => prev.filter(msg => !msg.showProjectSelector));
    setPendingTaskTitle(null);
    setSelectedProject(null);
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskDueDate(undefined);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Daily Tasks Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 h-96 overflow-y-auto p-4 border rounded-md">
          {messages.map((msg, index) => (
            <div key={index}>
              {msg.showProjectSelector ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* System Message */}
                  <div className="flex justify-start">
                    <div className="prose dark:prose-invert px-4 py-2 rounded-lg bg-muted max-w-md">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Hacker UI Task Form */}
                  <div className="border-2 border-foreground bg-background p-4 font-mono rounded-none">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider">Task Details</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelTaskCreation}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Project Selection */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-xs uppercase tracking-wide">Project *</Label>
                      {isLoadingProjects ? (
                        <div className="text-xs text-muted-foreground">Loading projects...</div>
                      ) : projects.length === 0 ? (
                        <div className="text-xs text-muted-foreground">No projects available. Create one first.</div>
                      ) : (
                        <div className="max-h-32 overflow-y-auto border border-foreground">
                          {projects.map((project) => (
                            <Button
                              key={project.id}
                              variant={selectedProject?.id === project.id ? "secondary" : "ghost"}
                              className="w-full justify-start rounded-none border-b border-foreground last:border-b-0 font-mono text-xs"
                              onClick={() => setSelectedProject(project)}
                            >
                              <div
                                className="w-2 h-2 mr-2"
                                style={{ backgroundColor: project.color }}
                              />
                              {project.name}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="task-desc" className="text-xs uppercase tracking-wide">Description</Label>
                      <Textarea
                        id="task-desc"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Add task description..."
                        className="font-mono text-xs rounded-none border-2"
                        rows={3}
                      />
                    </div>

                    {/* Priority */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="task-priority" className="text-xs uppercase tracking-wide">Priority</Label>
                      <Select value={taskPriority} onValueChange={setTaskPriority}>
                        <SelectTrigger id="task-priority" className="font-mono text-xs rounded-none border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-mono">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2 mb-4">
                      <Label className="text-xs uppercase tracking-wide">Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-mono text-xs rounded-none border-2",
                              !taskDueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {taskDueDate ? format(taskDueDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={taskDueDate}
                            onSelect={setTaskDueDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelTaskCreation}
                        className="flex-1 font-mono text-xs rounded-none border-2"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateTask}
                        disabled={!selectedProject || isLoading}
                        className="flex-1 font-mono text-xs rounded-none border-2"
                      >
                        {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        Create Task
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`prose dark:prose-invert px-4 py-2 rounded-lg max-w-xs md:max-w-md ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
              <div className="px-4 py-2 rounded-lg bg-muted">Thinking...</div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: /task Buy groceries or crear tarea Review docs"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}