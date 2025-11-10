// File: components/TimeReportCardWrapper.tsx (CORREGIDO - Cierre de Card)

"use client"; // ¡IMPORTANTE! Marca este componente como Cliente para usar hooks de estado y efecto.

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Clock } from "lucide-react";

// Importa tus componentes
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker"; 
import { TimeReportCard } from "@/components/TimeReportCard"; 
import { TimeEntry } from "@/lib/types"; // Asegúrate que esta ruta es correcta


// ⚠️ FUNCIÓN DE TOKEN: Debes adaptar esto a tu sistema de autenticación real
const getAuthToken = (): string | null => {
    // Reemplaza esto con tu lógica para obtener el token JWT del usuario logueado
    return localStorage.getItem('mi_token_jwt'); 
};


// --- Función de Fetch de Datos (Implementación con Autenticación Segura) ---
const fetchTimeEntries = async (startDate: Date, endDate: Date): Promise<TimeEntry[]> => {
    
    const authToken = getAuthToken();

    if (!authToken) {
        console.warn("ADVERTENCIA: Usuario no autenticado. Devolviendo datos vacíos.");
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
                // Envío del token JWT para autenticar al usuario
                'Authorization': `Bearer ${authToken}`, 
            },
        });

        if (!response.ok) {
            console.error(`Error ${response.status} al obtener datos:`, response.statusText);
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
            <CardHeader className="flex flex-row items-center justify-between space-x-4">
                <CardTitle>{reportTitle}</CardTitle>
                <div className="flex items-center space-x-2">
                    {/* Selector de fechas */}
                    <DateRangePicker 
                        date={dateRange} 
                        setDate={setDateRange} 
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
        // 🚨 AQUÍ ESTABA EL ERROR: Faltaba el cierre de la Card
    );
}