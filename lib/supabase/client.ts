import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // --- PASO DE DEPURACIÓN ---
  // Imprimimos en la consola del navegador los valores que Vercel le está dando a la app.
  console.log("Supabase URL from env:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Supabase Anon Key from env:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  // --- FIN DEL PASO DE DEPURACIÓN ---

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}