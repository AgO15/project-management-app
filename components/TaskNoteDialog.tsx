"use client";

import { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area"; 

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
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditContent(note.content);
  }, [note.content]);

  const handleSave = async () => {
    await onUpdateNote(note.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  if (!mounted) return null;

  // Cuerpo reutilizable con ScrollArea para el texto largo
  const Body = (
    <div className="flex-1 overflow-hidden min-h-0">
      <ScrollArea className="h-full w-full">
        <div className="px-4 py-4">
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] w-full resize-none focus-visible:ring-offset-0"
              autoFocus
            />
          ) : (
            <div className="whitespace-pre-wrap text-foreground break-words text-sm leading-relaxed">
              {note.content}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const Footer = (
    <div className="px-4 pb-4 pt-2">
      {isEditing ? (
        <div className="flex gap-2 justify-end">
          <Button onClick={handleSave} size="sm">Guardar Cambios</Button>
          <Button variant="outline" onClick={handleCancel} size="sm">Cancelar</Button>
        </div>
      ) : (
        <div className="flex gap-2 justify-end">
          <Button onClick={() => setIsEditing(true)} size="sm">Editar</Button>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cerrar</Button>
          </DialogClose>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md sm:max-h-[80vh] p-0 flex flex-col overflow-hidden gap-0">
          <DialogHeader className="p-4 pb-2 text-left flex-shrink-0 border-b">
            <DialogTitle>{isEditing ? "Editar Nota" : "Detalle de la Nota"}</DialogTitle>
            <DialogDescription className="hidden">Detalle de la nota seleccionada</DialogDescription>
          </DialogHeader>

          {Body}
          
          <DialogFooter className="p-0 flex-shrink-0 border-t bg-muted/10">
             {/* El footer se renderiza dentro de Body o aquí, en este caso lo pasamos directo */}
             {Footer}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-hidden flex flex-col">
        <DrawerHeader className="px-4 pt-4 text-left flex-shrink-0 border-b pb-2">
          <DrawerTitle>{isEditing ? "Editar Nota" : "Detalle de la Nota"}</DrawerTitle>
          <DrawerDescription className="hidden">Detalle de la nota seleccionada</DrawerDescription>
        </DrawerHeader>

        {Body}

        <DrawerFooter className="p-0 flex-shrink-0 border-t bg-muted/10">{Footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}