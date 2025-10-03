"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { updateNoteDetails } from "@/app/actions";

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

  const EditView = (
    <>
      <div className="px-4 space-y-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold" />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[200px]" />
      </div>
      <DrawerFooter className="pt-2 flex-row gap-2">
        <Button onClick={handleSave}>Save Changes</Button>
        <DrawerClose asChild>
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );

  const ReadView = (
    <>
      <DialogHeader className="px-4">
        <DialogTitle>{note.title}</DialogTitle>
        <DialogDescription className="pt-4 whitespace-pre-wrap">{note.content}</DialogDescription>
      </DialogHeader>
      <DialogFooter className="px-4">
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
      </DialogFooter>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">{isEditing ? EditView : ReadView}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>{isEditing ? EditView : ReadView}</DrawerContent>
    </Drawer>
  );
}