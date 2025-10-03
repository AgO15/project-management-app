"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditableTextProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  as?: "h1" | "p" | "textarea";
}

export function EditableText({
  initialValue,
  onSave,
  as = "p",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (value !== initialValue) {
      await onSave(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && as !== 'textarea') {
      handleSave();
    } else if (e.key === "Escape") {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (as === "textarea") {
      return (
        <Textarea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="text-muted-foreground mt-1 min-h-[60px]"
        />
      );
    }
    return (
      <Input
        ref={inputRef as React.Ref<HTMLInputElement>}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="text-2xl font-bold h-auto p-0"
      />
    );
  }

  const commonProps = {
    onClick: () => setIsEditing(true),
    className: "hover:cursor-text transition-colors hover:bg-muted/50 p-1 rounded-md",
  };

  if (as === "h1") {
    return (
      <h1 {...commonProps} className={`${commonProps.className} text-2xl font-bold`}>
        {value}
      </h1>
    );
  }

  return (
    <p {...commonProps} className={`${commonProps.className} text-muted-foreground mt-1`}>
      {value || "No description provided. Click to edit."}
    </p>
  );
}