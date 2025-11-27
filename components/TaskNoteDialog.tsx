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
import { LinkifiedText } from "@/components/LinkifiedText";

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
        <div className="px-6 py-4"> {/* Ajustado padding */}
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] w-full resize-none focus-visible:ring-offset-0"
              autoFocus
            />
          ) : (
            <LinkifiedText text={note.content} className="whitespace-pre-wrap text-foreground break-words text-sm leading-relaxed" />
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const Footer = (
    <div className="flex justify-end gap-2 p-4"> {/* Ajustado padding */}
      {isEditing ? (
        <>
          <Button onClick={handleSave} size="sm">Guardar Cambios</Button>
          <Button variant="outline" onClick={handleCancel} size="sm">Cancelar</Button>
        </>
      ) : (
        <>
          <Button onClick={() => setIsEditing(true)} size="sm">Editar</Button>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cerrar</Button>
          </DialogClose>
        </>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {/* Aumentar la altura mínima del diálogo y asegurar flex-col */}
        <DialogContent className="sm:max-w-md h-[500px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 text-left flex-shrink-0 border-b">
            <DialogTitle>{isEditing ? "Editar Nota" : "Detalle de la Nota"}</DialogTitle>
            <DialogDescription className="hidden">Detalle de la nota seleccionada</DialogDescription>
          </DialogHeader>

          {Body}

          {/* El footer ahora usa flex-shrink-0 y se posiciona correctamente */}
          <DialogFooter className="flex-shrink-0 border-t bg-muted/10 p-0">
            {Footer}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      {/* Aumentar la altura mínima del drawer y asegurar flex-col */}
      <DrawerContent className="h-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DrawerHeader className="px-6 pt-4 pb-2 text-left flex-shrink-0 border-b">
          <DrawerTitle>{isEditing ? "Editar Nota" : "Detalle de la Nota"}</DrawerTitle>
          <DrawerDescription className="hidden">Detalle de la nota seleccionada</DrawerDescription>
        </DrawerHeader>

        {Body}

        <DrawerFooter className="flex-shrink-0 border-t bg-muted/10 p-0">{Footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}