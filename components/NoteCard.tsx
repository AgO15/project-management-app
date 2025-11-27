"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LinkifiedText } from "@/components/LinkifiedText";

interface Note {
  id: string;
  created_at: string;
  title: string;
  content: string;
}

interface NoteCardProps {
  note: Note;
  onNoteDeleted: (noteId: string) => void;
  onViewNote: (note: Note) => void; // Add this prop
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return { truncated: text, isTooLong: false };
  }
  return { truncated: text.substring(0, maxLength) + "...", isTooLong: true };
}

export function NoteCard({ note, onNoteDeleted, onViewNote }: NoteCardProps) {
  const supabase = createClient();
  const { truncated, isTooLong } = truncateText(note.content, 150); // Truncate at 150 chars

  const handleDelete = async () => {
    await supabase.from("notes").delete().eq("id", note.id);
    onNoteDeleted(note.id);
  };

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{note.title}</h3>
          <LinkifiedText text={truncated} className="text-sm text-muted-foreground mt-2" />
          {isTooLong && (
            <button onClick={() => onViewNote(note)} className="text-sm text-blue-500 hover:underline mt-2">
              Show more
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the note. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Updated: {new Date(note.created_at).toLocaleString()}
      </p>
    </div>
  );
}