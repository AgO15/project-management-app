import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si el usuario ya tiene una sesión activa, lo enviamos al dashboard.
  // Si no, simplemente muestra esta página de bienvenida pública.
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a tu App de Gestión</h1>
      <p className="text-lg text-muted-foreground">
        Por favor, <a href="/auth/login" className="underline font-semibold">inicia sesión</a> para continuar.
      </p>
    </div>
  );
}