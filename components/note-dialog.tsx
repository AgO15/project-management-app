"use client";

import { useEffect, useState } from "react";
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
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { updateNoteDetails } from "@/app/actions";
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

export function NoteDialog({
  note,
  isOpen,
  onOpenChange,
  onNoteUpdated,
}: NoteDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleSave = async () => {
    const result = await updateNoteDetails(
      note.id,
      note.project_id,
      title,
      content
    );
    if (result.success) {
      toast.success("Note updated successfully.");
      onNoteUpdated({ ...note, title, content });
      setIsEditing(false);
    } else {
      toast.error(result.error || "Failed to update note.");
    }
  };

  const EditView = (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 pt-4 space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Note Title"
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] w-full resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Write your note here..."
          />
        </ScrollArea>
      </div>
      <DialogFooter className="px-4 pb-4 flex-row gap-2 justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </DialogFooter>
    </div>
  );

  const ReadView = (
    <div className="flex flex-col flex-1 overflow-hidden">
      <DialogHeader className="px-4 pt-4 text-left">
        <DialogTitle>{title || "Untitled Note"}</DialogTitle>
        <DialogDescription className="sr-only">
          Full note content
        </DialogDescription>
      </DialogHeader>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="py-4 whitespace-pre-wrap text-sm text-muted-foreground">
            {content}
          </div>
        </ScrollArea>
      </div>
      <DialogFooter className="px-4 pb-4">
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
      </DialogFooter>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-lg p-0 flex flex-col max-h-[80vh] overflow-hidden"
        >
          {isEditing ? EditView : ReadView}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] overflow-hidden flex flex-col">
        <DrawerHeader className="px-4 pt-4 text-left">
          <DrawerTitle>{isEditing ? "Edit Note" : "Note"}</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          {isEditing ? (
            <>
              <div className="px-4 pt-0 space-y-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Note Title"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-4">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] w-full resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Write your note here..."
                  />
                </ScrollArea>
              </div>
              <DrawerFooter className="px-4 pb-4">
                <div className="flex gap-2 justify-end w-full">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </DrawerFooter>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-4">
                  <div className="py-2">
                    <h3 className="sr-only">{title || "Untitled Note"}</h3>
                    <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {content}
                    </div>
                  </div>
                </ScrollArea>
              </div>
              <DrawerFooter className="px-4 pb-4">
                <div className="flex gap-2 justify-end w-full">
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                </div>
              </DrawerFooter>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
