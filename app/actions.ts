"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Extended to support cognitive fields
type UpdatableField =
  | "name"
  | "description"
  | "status"
  | "color"
  | "cycle_state"
  | "representation"
  | "exit_criteria"
  | "area_id";

export async function updateProjectField(
  projectId: string,
  field: UpdatableField,
  value: string | null
) {
  // Validación básica
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
    console.error("Error updating project:", error);
    return { success: false, error: error.message };
  }

  // ✅ IMPORTANTE: Revalidamos el path para que Next.js actualice la caché
  // y la interfaz muestre el estado real (no solo el optimista).
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/dashboard`); // También revalidamos el dashboard por si acaso

  return { success: true };
}


export async function updateNoteDetails(
  noteId: string,
  projectId: string,
  title: string,
  content: string
) {
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