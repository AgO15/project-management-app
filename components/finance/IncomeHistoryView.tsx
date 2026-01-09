"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/LanguageContext"
import {
    DollarSign,
    ChevronDown,
    ChevronUp,
    Calendar,
    TrendingUp,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { IncomeRecord, IncomeAllocation } from "@/lib/types"

interface IncomeHistoryViewProps {
    projectId: string
    className?: string
}

// Neumorphic styles
const neuCardStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.5)',
}

export function IncomeHistoryView({ projectId, className }: IncomeHistoryViewProps) {
    const [records, setRecords] = useState<IncomeRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const { language } = useLanguage()

    useEffect(() => {
        const fetchRecords = async () => {
            const supabase = createClient()

            const { data, error } = await supabase
                .from("income_records")
                .select("*")
                .eq("project_id", projectId)
                .order("period_start", { ascending: false })

            if (!error && data) {
                setRecords(data as IncomeRecord[])
            }
            setLoading(false)
        }

        fetchRecords()
    }, [projectId])

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString(language === 'es' ? 'es-VE' : 'en-US', {
            day: 'numeric',
            month: 'short'
        })
    }

    // Calculate totals
    const totals = records.reduce((acc, record) => ({
        totalBs: acc.totalBs + record.amount_bs,
        totalUsdBcv: acc.totalUsdBcv + record.amount_usd_bcv,
        totalUsdBinance: acc.totalUsdBinance + record.amount_usd_binance,
    }), { totalBs: 0, totalUsdBcv: 0, totalUsdBinance: 0 })

    if (loading) {
        return (
            <div className={cn("p-4 rounded-2xl", className)} style={neuCardStyle}>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#7C9EBC]" />
                </div>
            </div>
        )
    }

    if (records.length === 0) {
        return (
            <div className={cn("p-4 rounded-2xl", className)} style={neuCardStyle}>
                <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-[#7C9EBC]" />
                    <h3 className="font-medium text-[#444]">
                        {language === 'es' ? 'Historial de Ingresos' : 'Income History'}
                    </h3>
                </div>
                <p className="text-sm text-[#888] text-center py-4">
                    {language === 'es'
                        ? 'No hay registros de ingresos aún'
                        : 'No income records yet'
                    }
                </p>
            </div>
        )
    }

    return (
        <div className={cn("p-4 rounded-2xl", className)} style={neuCardStyle}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#7C9EBC]" />
                    <h3 className="font-medium text-[#444]">
                        {language === 'es' ? 'Historial de Ingresos' : 'Income History'}
                    </h3>
                </div>
                <span className="text-xs text-[#888] bg-[#F0F0F3] px-2 py-1 rounded-lg">
                    {records.length} {language === 'es' ? 'registros' : 'records'}
                </span>
            </div>

            {/* Summary */}
            <div
                className="p-3 rounded-xl mb-4 grid grid-cols-2 gap-3"
                style={{
                    backgroundColor: '#F0F0F3',
                    boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
                }}
            >
                <div className="text-center">
                    <p className="text-xs text-[#888]">Total (BCV)</p>
                    <p className="text-lg font-bold text-[#6366F1]">
                        ${totals.totalUsdBcv.toFixed(2)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-[#888]">Total (Binance)</p>
                    <p className="text-lg font-bold text-[#10B981]">
                        ${totals.totalUsdBinance.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Records List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {records.map((record) => (
                    <div
                        key={record.id}
                        className="rounded-xl overflow-hidden"
                        style={{
                            backgroundColor: '#F0F0F3',
                            boxShadow: 'inset 1px 1px 2px rgba(163, 177, 198, 0.2), inset -1px -1px 2px rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        {/* Record Header */}
                        <button
                            onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                            className="w-full p-3 flex items-center justify-between text-left hover:bg-[#E8EBEF] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-xs text-[#888]">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(record.period_start)} - {formatDate(record.period_end)}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-[#444]">
                                        {record.amount_bs.toLocaleString()} Bs
                                    </p>
                                    <p className="text-xs text-[#10B981]">
                                        ${record.amount_usd_binance.toFixed(2)}
                                    </p>
                                </div>
                                {expandedId === record.id
                                    ? <ChevronUp className="w-4 h-4 text-[#888]" />
                                    : <ChevronDown className="w-4 h-4 text-[#888]" />
                                }
                            </div>
                        </button>

                        {/* Expanded Details */}
                        {expandedId === record.id && (
                            <div className="px-3 pb-3 pt-0 border-t border-[#ddd]">
                                {/* Rates */}
                                <div className="grid grid-cols-2 gap-2 py-2 text-xs">
                                    <div>
                                        <span className="text-[#888]">BCV: </span>
                                        <span className="text-[#444]">{record.rate_bcv} → ${record.amount_usd_bcv.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#888]">Binance: </span>
                                        <span className="text-[#444]">{record.rate_binance} → ${record.amount_usd_binance.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Allocations */}
                                {record.allocations && record.allocations.length > 0 && (
                                    <div className="space-y-1 pt-2">
                                        <div className="flex items-center gap-1 text-xs text-[#7C9EBC] mb-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {language === 'es' ? 'División' : 'Allocation'}
                                        </div>
                                        {(record.allocations as IncomeAllocation[]).map((alloc, idx) => (
                                            <div key={idx} className="flex justify-between text-xs">
                                                <span className="text-[#666]">{alloc.category}</span>
                                                <span className="text-[#444]">
                                                    {alloc.percentage}% = ${alloc.amount_usd.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Notes */}
                                {record.notes && (
                                    <p className="text-xs text-[#888] italic mt-2 pt-2 border-t border-[#eee]">
                                        {record.notes}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
