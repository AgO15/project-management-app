// components/note-dialog.tsx
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

/**
 * IMPORTANT:
 * - We "latch" whether to use Dialog or Drawer once on mount to avoid
 *   Drawer<->Dialog switching, which causes hydration errors (#425/#423).
 */
export function NoteDialog({
  note,
  isOpen,
  onOpenChange,
  onNoteUpdated,
}: NoteDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  // Latch variant on mount; never switch during this component's lifetime.
  const [variant, setVariant] = useState<"dialog" | "drawer" | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDialog = window.matchMedia("(min-width: 768px)").matches;
      setVariant(prefersDialog ? "dialog" : "drawer");
    }
  }, []);
  if (variant === null) return null; // avoid SSR/CSR mismatch entirely

  // Keep local state in sync when the note prop changes
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

  // --- EDIT VIEW ---
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

      {/* Scrollable area needs a flex parent + min-h-0 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] w-full resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Write your note here..."
          />
        </ScrollArea>
      </div>

      <div className="px-4 pb-4 flex gap-2 justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  // --- READ VIEW ---
  const ReadView = (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 text-left">
        {/* DialogHeader adds extra wrappers; a simple div is enough for Drawer/Dialog */}
        <DialogTitle className="text-base font-semibold">
          {title || "Untitled Note"}
        </DialogTitle>
        {/* Provide a description for a11y if used inside Dialog */}
        <DialogDescription className="sr-only">Full note content</DialogDescription>
      </div>

      {/* Critical: min-h-0 + explicit height so ScrollArea activates immediately */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="max-h-[60vh] px-4">
          <div className="py-4 whitespace-pre-wrap text-sm text-muted-foreground">
            {content}
          </div>
        </ScrollArea>
      </div>

      <div className="px-4 pb-4">
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
      </div>
    </div>
  );

  if (variant === "dialog") {
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

  // Mobile drawer (latched)
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] overflow-hidden flex flex-col p-0">
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

              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full px-4">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[220px] w-full resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="max-h-[70vh] px-4">
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
