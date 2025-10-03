// File: components/chat-component.tsx (or similar)

"use client";

import { useState } from "react";
import ReactMarkdown from 'react-markdown'; // <-- IMPORT a
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Daily Tasks Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 h-96 overflow-y-auto p-4 border rounded-md">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`prose dark:prose-invert px-4 py-2 rounded-lg max-w-xs md:max-w-md ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {/* --- THIS IS THE UPDATED PART --- */}
                {msg.role === 'bot' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
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
            placeholder="Ask about your tasks for today..."
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