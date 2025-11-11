// File: app/api/time-entries/route.ts (CORREGIDO)

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 1. Importar el helper correcto: createServerClient de @supabase/ssr
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
    
    // 2. Crear el almacén de cookies de Next.js
    const cookieStore = cookies();

    // 3. Crear el cliente de Supabase para el lado del servidor (API Route)
    //    usando el patrón de @supabase/ssr
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // NOTA: set y remove no son necesarios para un GET,
                // pero se incluyen aquí si expandes la API (POST, PUT, etc.)
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );

    // 4. Obtener el usuario (esto ahora SÍ funcionará)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // Si no hay usuario, devolver error 401
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 5. Obtener los parámetros de fecha de la URL
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
        return new NextResponse(JSON.stringify({ error: 'Missing date parameters' }), { status: 400 });
    }

    // 6. Lógica de consulta a Supabase (sin cambios)
    try {
        const { data, error } = await supabase
            .from('time_entries') // REEMPLAZA 'time_entries' por el nombre real de tu tabla
            .select('*, tasks(title)') // 🚨 MODIFICACIÓN: Hacemos join con 'tasks' para obtener el 'title'
            .eq('user_id', user.id) // Filtrar por el ID del usuario autenticado
            .gte('start_time', startDate)
            .lte('end_time', endDate); // Asegúrate que la columna se llama 'end_time' o 'start_time'

        if (error) {
            console.error('Supabase Query Error:', error);
            throw new Error(error.message);
        }

        // 7. Devolver las entradas de tiempo
        return NextResponse.json(data);

    } catch (error) {
        console.error('API Error:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch time entries' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}