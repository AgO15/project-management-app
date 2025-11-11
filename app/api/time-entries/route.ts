// File: app/api/time-entries/route.ts (Ejemplo)
import { NextResponse } from 'next/server';

// ⚠️ NECESITAS UNA FUNCIÓN PARA CREAR EL CLIENTE DE SUPABASE DEL LADO DEL SERVIDOR (Server Component Client)
// La ruta es probable que sea diferente a la que usaste en el cliente
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'; // O el helper que uses
import { cookies } from 'next/headers'; 

export async function GET(request: Request) {
    
    // 1. Inicializa el cliente de Supabase para la ruta de la API (Server Side)
    const supabase = createRouteHandlerClient({ cookies });
    
    // 2. Obtener el usuario actual. Esto usa el token JWT que el frontend envió automáticamente
    // en la cookie de sesión (si configuraste Supabase correctamente).
    const { 
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // Si no hay usuario, devolver error 401 (No autorizado)
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 3. Obtener los parámetros de fecha de la URL
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
        return new NextResponse(JSON.stringify({ error: 'Missing date parameters' }), { status: 400 });
    }

    // 4. Lógica de consulta a Supabase
    try {
        const { data, error } = await supabase
            .from('time_entries') // REEMPLAZA 'time_entries' por el nombre real de tu tabla
            .select('*')
            .eq('user_id', user.id) // Filtrar por el ID del usuario autenticado
            .gte('start_time', startDate)
            .lte('end_time', endDate);

        if (error) {
            console.error('Supabase Query Error:', error);
            throw new Error(error.message);
        }

        // 5. Devolver las entradas de tiempo
        return NextResponse.json(data);

    } catch (error) {
        console.error('API Error:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch time entries' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}