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

// Define la estructura de una nota que el diálogo espera recibir
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
    setIsEditing(false); // Vuelve al modo de vista después de guardar
  };

  const handleCancel = () => {
    setEditContent(note.content); // Resetea cualquier cambio no guardado
    setIsEditing(false);
  };

  // Contenido dinámico para el diálogo/drawer
  const DialogContentArea = (
    <>
      <DialogHeader className="p-4 text-left">
        <DialogTitle>{isEditing ? "Editar Nota" : "Nota Completa"}</DialogTitle>
        <DialogDescription className="pt-4">
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] whitespace-pre-wrap"
              autoFocus
            />
          ) : (
            <p className="whitespace-pre-wrap text-foreground">{note.content}</p>
          )}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="px-4 pb-4 flex-row justify-end gap-2">
        {isEditing ? (
          <>
            <Button onClick={handleSave}>Guardar Cambios</Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </>
        )}
      </DialogFooter>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">{DialogContentArea}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>{DialogContentArea}</DrawerContent>
    </Drawer>
  );
}