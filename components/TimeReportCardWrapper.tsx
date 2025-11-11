// File: components/TimeReportCardWrapper.tsx

"use client"; // 🚨 ¡IMPORTANTE! Necesario para usar hooks y estado.

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Clock } from "lucide-react";

// Importa tu función para inicializar el cliente de Supabase del LADO DEL CLIENTE
import { createClient } from '@/lib/supabase/client'; // 
// Importa tus componentes
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker"; 
import { TimeReportCard } from "@/components/TimeReportCard"; 
import { TimeEntry } from "@/lib/types"; 


// --- Función de Fetch de Datos (Implementación con Supabase) ---
const fetchTimeEntries = async (startDate: Date, endDate: Date): Promise<TimeEntry[]> => {
    
    // 1. Inicializa el cliente de Supabase (del lado del cliente)
    const supabase = createClient();
    
    // 2. Obtener la sesión (esto es asíncrono y maneja el almacenamiento de tokens)
    const { data: { session } } = await supabase.auth.getSession();
    
    const authToken = session?.access_token; // Este es el JWT que necesita el backend

    if (!authToken) {
        console.warn("ADVERTENCIA: Usuario no autenticado (Supabase). Devolviendo datos vacíos.");
        return []; 
    }

    // Formatear fechas para la URL
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    const apiUrl = `/api/time-entries?startDate=${startStr}&endDate=${endStr}`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 3. Envío del token JWT de Supabase
                'Authorization': `Bearer ${authToken}`, 
            },
        });

        if (!response.ok) {
            console.error(`Error ${response.status} al obtener datos:`, response.statusText);
            
            // Si el token falló, Supabase lo manejará, pero aquí podemos logear el error del API
            throw new Error(`Error ${response.status}: No se pudieron cargar las entradas.`);
        }

        const data: TimeEntry[] = await response.json();
        return data; 

    } catch (error) {
        console.error("Fallo de red al obtener el informe de tiempo:", error);
        return [];
    }
};

export function TimeReportCardWrapper() {
    // 1. Inicializar el estado del rango (por defecto: Últimos 7 días)
    const initialDateRange: DateRange = {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
    };
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 2. Efecto para recargar los datos al cambiar el rango
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            setIsLoading(true);
            
            fetchTimeEntries(dateRange.from, dateRange.to)
                .then(data => setTimeEntries(data))
                .catch(error => {
                    console.error("Error en la carga de datos:", error);
                    setTimeEntries([]);
                })
                .finally(() => setIsLoading(false));
        }
    }, [dateRange]); 

    // Título dinámico para la Card
    const reportTitle = dateRange?.from && dateRange?.to
        ? `Time Report (${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')})`
        : "Time Report";

    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                <CardTitle>{reportTitle}</CardTitle>
                <div className="flex items-center space-x-2">
                    {/* Selector de fechas */}
                    <DateRangePicker 
                        date={dateRange} 
                        setDate={setDateRange} 
                        className="w-full sm:w-[240px]"
                    />
                    <Link href="/dashboard/reports" className="text-muted-foreground hover:text-primary">
                        <Clock className="h-5 w-5" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {/* Pasa los datos al componente de visualización */}
                <TimeReportCard 
                    timeEntries={timeEntries} 
                    reportTitle={reportTitle} 
                    isLoading={isLoading}
                />
            </CardContent>
        </Card>
    );
}