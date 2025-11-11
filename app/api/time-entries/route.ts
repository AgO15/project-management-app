import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    // 1. Inicializa el cliente de Supabase para la ruta de la API (Server Side)
    const supabase = createRouteHandlerClient({ cookies });
    
    // 2. Obtener la sesión actual. Este es el método más recomendado.
    const { 
        data: { session },
        error: sessionError 
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
        // Devolver 401 si no hay sesión válida o hubo un error al obtenerla.
        console.error("GET /api/time-entries: Error 401. No se pudo obtener la sesión o es inválida.");
        return new NextResponse(JSON.stringify({ error: 'Unauthorized: User not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const userId = session.user.id;

    // 3. Obtener los parámetros de fecha de la URL
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
        return new NextResponse(JSON.stringify({ error: 'Missing date parameters' }), { status: 400 });
    }

    // 4. Lógica de consulta a Supabase
    try {
        // Aseguramos que la consulta use los campos que definimos para el reporte
        const { data, error } = await supabase
            .from('time_entries') 
            .select('id, description, duration_minutes, created_at')
            .eq('user_id', userId) 
            .gte('created_at', startDate) // Filtrar por fecha de inicio (>=)
            .lte('created_at', endDate)   // Filtrar por fecha de fin (<=)
            .order('created_at', { ascending: false }); // Ordenar por fecha

        if (error) {
            console.error('Supabase Query Error:', error);
            throw new Error(error.message);
        }

        // 5. Devolver las entradas de tiempo
        return NextResponse.json(data);

    } catch (error) {
        // Manejo de errores internos (ej. fallo de conexión DB)
        console.error('API Error:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch time entries' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}