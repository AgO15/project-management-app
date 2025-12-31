"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X, StickyNote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { TaskNoteDialog } from "@/components/TaskNoteDialog";
import { LinkifiedText } from "@/components/LinkifiedText";
import { formatDateTime } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ProjectNotesProps {
  projectId: string;
  notes: Note[];
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return { truncated: text, isTooLong: false };
  }
  return { truncated: text.substring(0, maxLength) + "...", isTooLong: true };
}

export function ProjectNotes({ projectId, notes: initialNotes }: ProjectNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const createNote = async () => {
    if (!newNoteContent.trim()) return;

    setLoading(true);
    const supabase = createClient();
    try {
      // 1. Obtener el usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No estás autenticado");
      }

      const { data, error } = await supabase
        .from("notes")
        .insert({
          content: newNoteContent.trim(),
          project_id: projectId,
          user_id: user.id, // 2. Enviamos el ID del usuario (Solución al error 403)
          title: "Nota de Proyecto" // Título por defecto
        })
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNoteContent("");
      setIsCreating(false);

      toast({
        title: "Note created",
        description: "Your note has been created successfully.",
      });

      router.refresh(); // Refrescar para asegurar consistencia
    } catch (error: any) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));

      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (noteId: string, newContent: string) => {
    if (!newContent.trim()) return;

    setLoading(true);
    const supabase = createClient();
    try {
      const { data: updatedNote, error } = await supabase
        .from("notes")
        .update({
          content: newContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId)
        .select()
        .single();

      if (error) throw error;

      // Update local state to avoid a full refresh
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n));

      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
      setSelectedNote(null); // Close the dialog
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Project Notes</h2>
            <Badge variant="secondary">{notes.length}</Badge>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          )}
        </div>

        {/* Create new note form */}
        {isCreating && (
          <Card>
            <CardContent className="p-4">
              <Textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your note here..."
                className="min-h-[100px] mb-3"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={createNote}
                  disabled={loading || !newNoteContent.trim()}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Save Note"}
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false);
                    setNewNoteContent("");
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing notes list */}
        {notes.length === 0 && !isCreating ? (
          <Card>
            <CardContent className="p-6 text-center">
              <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">No notes yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first project note.
              </p>
              <Button onClick={() => setIsCreating(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => {
              const { truncated, isTooLong } = truncateText(note.content, 200);
              return (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <LinkifiedText text={truncated} className="text-foreground whitespace-pre-wrap mb-3 text-sm" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {note.updated_at !== note.created_at ? "Updated" : "Created"}{" "}
                        {formatDateTime(note.updated_at)}
                      </span>
                      <div className="flex gap-1">
                        {isTooLong && (
                          <Button onClick={() => setSelectedNote(note)} variant="link" size="sm" className="p-0 h-auto text-blue-500 mr-2">
                            Show more
                          </Button>
                        )}
                        <Button onClick={() => setSelectedNote(note)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => deleteNote(note.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Render the Dialog when a note is selected */}
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