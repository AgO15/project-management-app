"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X, StickyNote, ChevronDown, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TaskNoteDialog } from "./TaskNoteDialog"; // <-- 1. Importar el nuevo diálogo

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface TaskNotesProps {
  taskId: string;
  projectId: string;
  notes: Note[];
}

// 2. Función para truncar texto
function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return { truncatedText: text, isTruncated: false };
  }
  return {
    truncatedText: text.substring(0, maxLength) + "...",
    isTruncated: true,
  };
}

export function TaskNotes({ taskId, projectId, notes }: TaskNotesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null); // <-- 3. Estado para el diálogo
  const [newNoteContent, setNewNoteContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const createNote = async () => {
    // (Esta función no cambia, la dejamos como estaba)
    if (!newNoteContent.trim()) return;
    setLoading(true);
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("notes").insert({
        content: newNoteContent.trim(),
        title: `Nota de Tarea`,
        task_id: taskId,
        project_id: projectId,
        user_id: user.id,
      });
      if (error) throw error;
      toast({ title: "Nota creada", description: "Tu nota ha sido guardada con éxito." });
      setNewNoteContent("");
      setIsCreating(false);
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error al crear la nota", description: error.message || "Por favor, intenta de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (noteId: string, newContent: string) => {
    // 4. Actualizamos esta función para que cierre el diálogo al terminar
    if (!newContent.trim()) return;
    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("notes").update({ content: newContent.trim(), updated_at: new Date().toISOString() }).eq("id", noteId);
      if (error) throw error;
      toast({ title: "Nota actualizada", description: "Tu nota ha sido actualizada con éxito." });
      setSelectedNote(null); // Cierra el diálogo
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error al actualizar", description: error.message || "Por favor, intenta de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    // (Esta función no cambia)
    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) throw error;
      toast({ title: "Nota eliminada", description: "La nota ha sido eliminada." });
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message || "Por favor, intenta de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* ... (El CollapsibleTrigger no cambia) ... */}
        <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <StickyNote className="h-4 w-4" />
                <span className="text-sm">Notas</span>
                {notes.length > 0 && (<Badge variant="secondary" className="text-xs">{notes.length}</Badge>)}
            </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="space-y-3 pl-6">
            {/* ... (La sección para crear una nota nueva no cambia) ... */}
            {!isCreating ? (<Button onClick={() => setIsCreating(true)} variant="outline" size="sm" className="flex items-center gap-2"><Plus className="h-3 w-3" />Añadir Nota</Button>) : (<Card><CardContent className="p-3"><Textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Añade una nota para esta tarea..." rows={3} className="mb-2" /><div className="flex gap-2"><Button onClick={createNote} disabled={loading || !newNoteContent.trim()} size="sm"><Save className="h-3 w-3 mr-1" />Guardar</Button><Button onClick={() => { setIsCreating(false); setNewNoteContent(""); }} variant="outline" size="sm"><X className="h-3 w-3 mr-1" />Cancelar</Button></div></CardContent></Card>)}
            
            {/* 5. Lógica de renderizado de notas ACTUALIZADA */}
            {notes.map((note) => {
              const { truncatedText, isTruncated } = truncateText(note.content, 180);
              return (
                <Card key={note.id} className="bg-muted/30">
                  <CardContent className="p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap mb-2">{truncatedText}</p>
                    {isTruncated && (
                      <button
                        onClick={() => setSelectedNote(note)}
                        className="text-sm text-blue-500 hover:underline mb-2"
                      >
                        Ver más
                      </button>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.updated_at).toLocaleString()}
                      </span>
                      <div className="flex gap-1">
                        <Button onClick={() => setSelectedNote(note)} variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button onClick={() => deleteNote(note.id)} variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 6. Renderizar el diálogo cuando una nota está seleccionada */}
      {selectedNote && (
        <TaskNoteDialog
          note={selectedNote}
          isOpen={!!selectedNote}
          onOpenChange={(isOpen) => !isOpen && setSelectedNote(null)}
          onUpdateNote={updateNote}
        />
      )}
    </>
  );
}