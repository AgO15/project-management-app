"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthListener() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Prioridad 1: Si es un evento de recuperación, envía a la página de actualizar contraseña.
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/update-password');
      } 
      // Prioridad 2: Para cualquier otro inicio de sesión o refresco, solo actualiza la página.
      else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
      // Prioridad 3: Si el usuario cierra sesión, llévalo al login.
      else if (event === 'SIGNED_OUT') {
        router.push('/auth/login');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return null; // Este componente no renderiza nada
}