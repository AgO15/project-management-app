"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area"; // 👈 ADD THIS

interface Note {
  id: string;
  content: string;
}

interface TaskNoteDialogProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateNote: (noteId: string, newContent: string) => Promise<void>;
}

export function TaskNoteDialog({ note, isOpen, onOpenChange, onUpdateNote }: TaskNoteDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSave = async () => {
    await onUpdateNote(note.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  // Reusable body with ScrollArea. We rely on the parent container
  // being a flex column with overflow hidden; this area gets the flex-1 space.
  const Body = (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full px-4">
        <div className="py-4">
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] resize-none"
              autoFocus
            />
          ) : (
            <p className="whitespace-pre-wrap text-foreground">{note.content}</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const Footer = (
    <div className="px-4 pb-4">
      {isEditing ? (
        <div className="flex gap-2 justify-end">
          <Button onClick={handleSave}>Guardar Cambios</Button>
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
        </div>
      ) : (
        <div className="flex gap-2 justify-end">
          <Button onClick={() => setIsEditing(true)}>Editar</Button>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {/* Make the dialog a flex column, cap height, and clip overflow */}
        <DialogContent className="sm:max-w-md p-0 flex flex-col max-h-[80vh] overflow-hidden">
          <DialogHeader className="p-4 text-left">
            <DialogTitle>{isEditing ? "Editar Nota" : "Nota Completa"}</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {Body}
          <DialogFooter className="p-0">{Footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      {/* Cap height on mobile as well, and clip overflow */}
      <DrawerContent className="max-h-[85vh] overflow-hidden">
        <DrawerHeader className="px-4 pt-4 text-left">
          <DrawerTitle>{isEditing ? "Editar Nota" : "Nota Completa"}</DrawerTitle>
          <DrawerDescription />
        </DrawerHeader>

        {Body}

        <DrawerFooter className="p-0">{Footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
