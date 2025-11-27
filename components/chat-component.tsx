// File: components/chat-component.tsx (or similar)

"use client";

import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCreationForm } from "@/components/chat/TaskCreationForm";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'bot' | 'form';
  content: string;
  formType?: 'task-creation';
  formData?: any;
}

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Local Commands
    if (input.trim().toLowerCase() === '/clear') {
      setMessages([]);
      setInput("");
      // Task Creation Command
      const createTaskMatch = input.match(/^\/create task\s+(.+)$/i);
      if (createTaskMatch) {
        const taskName = createTaskMatch[1].trim();
        const userMessage: Message = { role: 'user', content: input };
        const formMessage: Message = {
          role: 'form',
          content: '',
          formType: 'task-creation',
          formData: { initialTaskName: taskName }
        };
        setMessages((prev) => [...prev, userMessage, formMessage]);
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

        // Create project directly
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
            content: `✅ **Project created successfully!**\\n\\nProject: **${data.project.name}**\\n\\nYou can now create tasks in this project using \`/create task [task name]\``
          };
          setMessages((prev) => [...prev, botMessage]);

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

    const handleTaskCreation = async (taskData: any) => {
      try {
        const response = await fetch('/api/tasks/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) throw new Error('Failed to create task');

        const data = await response.json();

        // Remove the form message and add success message
        setMessages((prev) => {
          const filtered = prev.filter(msg => msg.formType !== 'task-creation');
          return [
            ...filtered,
            {
              role: 'bot',
              content: `✅ **Task created successfully!**\\n\\nTask: **${data.task.title}**\\nPriority: ${data.task.priority}\\nStatus: ${data.task.status}`
            }
          ];
        });

        toast({
          title: "Task created",
          description: `${data.task.title} has been created successfully.`,
        });
      } catch (error) {
        console.error("Task creation error:", error);
        toast({
          title: "Error",
          description: "Failed to create task. Please try again.",
          variant: "destructive",
        });
      }
    };

    const handleCancelForm = () => {
      setMessages((prev) => prev.filter(msg => msg.formType !== 'task-creation'));
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
                {msg.role === 'form' && msg.formType === 'task-creation' ? (
                  <TaskCreationForm
                    initialTaskName={msg.formData.initialTaskName}
                    onSubmit={handleTaskCreation}
                    onCancel={handleCancelForm}
                  />
                ) : (
                  <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`prose dark:prose-invert px-4 py-2 rounded-lg max-w-xs md:max-w-md ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {msg.role === 'bot' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg bg-muted">Thinking...</div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 pt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try: /create task Buy groceries"
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