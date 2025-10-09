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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSave = async () => {
    await onUpdateNote(note.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const DialogContentArea = (
    <>
      <DialogHeader className="p-4 text-left flex-shrink-0">
        <DialogTitle>{isEditing ? "Edit Note" : "Full Note"}</DialogTitle>
      </DialogHeader>
      
      <ScrollArea className="px-4 flex-grow">
        {/* --- CORRECCIÓN: Se cambió DialogDescription por un div --- */}
        <div className="py-4">
          {isEditing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] w-full resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 whitespace-pre-wrap"
              autoFocus
            />
          ) : (
            <p className="whitespace-pre-wrap text-foreground">{note.content}</p>
          )}
        </div>
        {/* --------------------------------------------------------- */}
      </ScrollArea>
      
      <DialogFooter className="px-4 pb-4 flex-row justify-end gap-2 flex-shrink-0">
        {isEditing ? (
          <>
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </>
        )}
      </DialogFooter>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md p-0 flex flex-col h-[70vh]">
            {DialogContentArea}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="h-[80vh] flex flex-col">
            {DialogContentArea}
        </div>
      </DrawerContent>
    </Drawer>
  );
}