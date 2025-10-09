"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { updateNoteDetails } from "@/app/actions";
// --- 1. Importa el componente ScrollArea ---
import { ScrollArea } from "@/components/ui/scroll-area";

interface Note {
  id: string;
  title: string;
  content: string;
  project_id: string;
}

interface NoteDialogProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onNoteUpdated: (updatedNote: Note) => void;
}

export function NoteDialog({ note, isOpen, onOpenChange, onNoteUpdated }: NoteDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Sincroniza el estado si la nota que se pasa como prop cambia
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleSave = async () => {
    const result = await updateNoteDetails(note.id, note.project_id, title, content);
    if (result.success) {
      toast.success("Note updated successfully.");
      onNoteUpdated({ ...note, title, content });
      setIsEditing(false);
    } else {
      toast.error(result.error || "Failed to update note.");
    }
  };

  // --- VISTA DE EDICIÓN ---
  const EditView = (
    <>
      <div className="px-4 pt-4 space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Note Title"
        />
        {/* 2. Envuelve el Textarea en un ScrollArea para notas largas */}
        <ScrollArea className="h-72">
           <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full min-h-[280px] w-full resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Write your note here..."
          />
        </ScrollArea>
      </div>
      <DrawerFooter className="pt-2 flex-row gap-2">
        <Button onClick={handleSave}>Save Changes</Button>
        <DrawerClose asChild>
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );

  // --- VISTA DE LECTURA ---
  const ReadView = (
    <>
      <DialogHeader className="px-4 pt-4 text-left">
        <DialogTitle>{title || "Untitled Note"}</DialogTitle>
      </DialogHeader>
      {/* 3. Envuelve el contenido en un ScrollArea para hacerlo desplazable */}
      <ScrollArea className="max-h-[60vh] px-4">
        <div className="py-4 whitespace-pre-wrap text-sm text-muted-foreground">
          {content}
        </div>
      </ScrollArea>
      <DialogFooter className="px-4 pb-4">
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
      </DialogFooter>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[80vh]">
          {isEditing ? EditView : ReadView}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        {/* Usamos un div para limitar la altura en móvil también */}
        <div className="max-h-[80vh] flex flex-col">
            {isEditing ? EditView : ReadView}
        </div>
      </DrawerContent>
    </Drawer>
  );
}