// File: components/TimeReportCardWrapper.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Clock } from "lucide-react";

import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { TimeReportCard } from "@/components/TimeReportCard";
import { TimeEntry } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

// --- Data Fetch Function ---
const fetchTimeEntries = async (startDate: Date, endDate: Date): Promise<TimeEntry[]> => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;

    if (!authToken) {
        console.warn("User not authenticated. Returning empty data.");
        return [];
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    const apiUrl = `/api/time-entries?startDate=${startStr}&endDate=${endStr}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            console.error(`Error ${response.status}:`, response.statusText);
            throw new Error(`Error ${response.status}: Could not load entries.`);
        }

        const data: TimeEntry[] = await response.json();
        return data;

    } catch (error) {
        console.error("Network error fetching time report:", error);
        return [];
    }
};

export function TimeReportCardWrapper() {
    const { t, language } = useLanguage();
    const dateLocale = language === 'es' ? es : enUS;

    // Initialize date range (default: Last 7 days)
    const initialDateRange: DateRange = {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
    };

    const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Effect to reload data when range changes
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            setIsLoading(true);

            fetchTimeEntries(dateRange.from, dateRange.to)
                .then(data => setTimeEntries(data))
                .catch(error => {
                    console.error("Error loading data:", error);
                    setTimeEntries([]);
                })
                .finally(() => setIsLoading(false));
        }
    }, [dateRange]);

    // Dynamic title with localized date format
    const reportTitle = dateRange?.from && dateRange?.to
        ? `${t('timeReport')} (${format(dateRange.from, 'MMM dd', { locale: dateLocale })} - ${format(dateRange.to, 'MMM dd', { locale: dateLocale })})`
        : t('timeReport');

    return (
        <div
            className="rounded-3xl bg-[#E0E5EC] overflow-hidden"
            style={{
                boxShadow: '9px 9px 18px rgba(163, 177, 198, 0.6), -9px -9px 18px rgba(255, 255, 255, 0.5)'
            }}
        >
            <div className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                    <h3 className="text-lg font-semibold text-[#444444]">{reportTitle}</h3>
                    <div className="flex items-center space-x-2">
                        <DateRangePicker
                            date={dateRange}
                            setDate={setDateRange}
                            className="w-full sm:w-[280px]"
                        />
                        <Link
                            href="/dashboard/reports"
                            className="text-[#888888] hover:text-[#7C9EBC] transition-colors"
                        >
                            <Clock className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
                <TimeReportCard
                    timeEntries={timeEntries}
                    reportTitle={reportTitle}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}