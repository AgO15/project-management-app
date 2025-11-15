"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type UpdatableField = "name" | "description" | "status";

export async function updateProjectField(
  projectId: string,
  field: UpdatableField,
  value: string
) {
  // Basic validation
  if (field === "name" && !value) {
    return { success: false, error: "Project name cannot be empty." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({
      [field]: value,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  // 👇 ¡LA LÍNEA CLAVE! LA COMENTAMOS O ELIMINAMOS
  // revalidatePath(`/projects/${projectId}`); 
  
  return { success: true };
}

// ... (la función updateNoteDetails no cambia) ...
export async function updateNoteDetails(
  noteId: string,
  projectId: string,
  title: string,
  content: string
) {
//... (código igual)
  if (!title || !content) {
    return { success: false, error: "Title and content cannot be empty." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", noteId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}