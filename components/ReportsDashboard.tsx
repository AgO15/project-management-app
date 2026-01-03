"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/LanguageContext"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from "recharts"
import { Clock, TrendingUp, Calendar, BarChart3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Neumorphic styles
const neuCardStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.5)',
}

const neuInsetStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
}

// Chart colors
const COLORS = ['#7C9EBC', '#A78BFA', '#34D399', '#F59E0B', '#EC4899', '#6366F1']

interface TimeEntryWithTask {
    id: string
    duration_minutes: number | null
    start_time: string
    task_id: string
    tasks: {
        title: string
        project_id: string
        status: string
        projects: {
            name: string
        } | null
    } | null
}

interface ChartData {
    name: string
    value: number
}

const formatDuration = (minutes: number) => {
    if (!minutes || minutes < 1) return "0m"
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
}

const formatHours = (minutes: number) => {
    return (minutes / 60).toFixed(1)
}

export function ReportsDashboard() {
    const { t, language } = useLanguage()
    const [timeRange, setTimeRange] = useState("7")
    const [loading, setLoading] = useState(true)
    const [timeEntries, setTimeEntries] = useState<TimeEntryWithTask[]>([])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const daysAgo = parseInt(timeRange)
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - daysAgo)

            const { data, error } = await supabase
                .from("time_entries")
                .select(`
                    id,
                    duration_minutes,
                    start_time,
                    task_id,
                    tasks (
                        title,
                        project_id,
                        status,
                        projects (
                            name
                        )
                    )
                `)
                .eq("user_id", user.id)
                .gte("start_time", startDate.toISOString())
                .not("duration_minutes", "is", null)
                .order("start_time", { ascending: false })

            if (!error && data) {
                setTimeEntries(data as unknown as TimeEntryWithTask[])
            }
            setLoading(false)
        }

        fetchData()
    }, [timeRange])

    // Calculate total time
    const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)

    // Time by project
    const timeByProject = timeEntries.reduce((acc, entry) => {
        const projectName = entry.tasks?.projects?.name || "Sin proyecto"
        acc[projectName] = (acc[projectName] || 0) + (entry.duration_minutes || 0)
        return acc
    }, {} as Record<string, number>)

    const projectData: ChartData[] = Object.entries(timeByProject)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)

    // Time by day
    const timeByDay = timeEntries.reduce((acc, entry) => {
        const date = new Date(entry.start_time).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
            weekday: 'short',
            day: 'numeric'
        })
        acc[date] = (acc[date] || 0) + (entry.duration_minutes || 0)
        return acc
    }, {} as Record<string, number>)

    const dayData: ChartData[] = Object.entries(timeByDay)
        .map(([name, value]) => ({ name, value }))
        .reverse()

    // Time by task status
    const timeByStatus = timeEntries.reduce((acc, entry) => {
        const status = entry.tasks?.status || 'unknown'
        const statusLabel = status === 'todo' ? t('todo') : status === 'in_progress' ? t('inProgress') : t('completed')
        acc[statusLabel] = (acc[statusLabel] || 0) + (entry.duration_minutes || 0)
        return acc
    }, {} as Record<string, number>)

    const statusData: ChartData[] = Object.entries(timeByStatus)
        .map(([name, value]) => ({ name, value }))

    const rangeLabels: Record<string, string> = {
        '7': language === 'es' ? 'Últimos 7 días' : 'Last 7 days',
        '14': language === 'es' ? 'Últimos 14 días' : 'Last 14 days',
        '30': language === 'es' ? 'Últimos 30 días' : 'Last 30 days',
        '90': language === 'es' ? 'Últimos 3 meses' : 'Last 3 months',
    }

    return (
        <div className="space-y-6">
            {/* Header with date range selector */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#444444]">
                        {language === 'es' ? 'Reportes de Tiempo' : 'Time Reports'}
                    </h1>
                    <p className="text-[#888888] text-sm">
                        {language === 'es' ? 'Análisis de tu productividad' : 'Productivity analysis'}
                    </p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-[180px] h-10 rounded-xl border-0 text-[#444444]"
                        style={neuInsetStyle}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0" style={{ backgroundColor: '#F0F0F3' }}>
                        <SelectItem value="7" className="rounded-lg">{rangeLabels['7']}</SelectItem>
                        <SelectItem value="14" className="rounded-lg">{rangeLabels['14']}</SelectItem>
                        <SelectItem value="30" className="rounded-lg">{rangeLabels['30']}</SelectItem>
                        <SelectItem value="90" className="rounded-lg">{rangeLabels['90']}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-64 rounded-3xl animate-pulse"
                            style={{ backgroundColor: '#E0E5EC' }}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Time Card */}
                    <div className="rounded-3xl p-6" style={neuCardStyle}>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                                    boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                                }}
                            >
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#444444]">
                                {language === 'es' ? 'Tiempo Total' : 'Total Time'}
                            </h2>
                        </div>
                        <div className="text-center py-8">
                            <p className="text-5xl font-bold text-[#444444] mb-2">
                                {formatDuration(totalMinutes)}
                            </p>
                            <p className="text-[#888888]">
                                {rangeLabels[timeRange]}
                            </p>
                            <p className="text-sm text-[#7C9EBC] mt-2">
                                {timeEntries.length} {language === 'es' ? 'registros' : 'entries'}
                            </p>
                        </div>
                    </div>

                    {/* Time by Project - Bar Chart */}
                    <div className="rounded-3xl p-6" style={neuCardStyle}>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(145deg, #34D399, #10B981)',
                                    boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                                }}
                            >
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#444444]">
                                {language === 'es' ? 'Por Proyecto' : 'By Project'}
                            </h2>
                        </div>
                        {projectData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={projectData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#D0D5DC" />
                                    <XAxis type="number" stroke="#888888" fontSize={12} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        width={100}
                                        tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [formatDuration(value), 'Tiempo']}
                                        contentStyle={{
                                            backgroundColor: '#F0F0F3',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.4)'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#7C9EBC" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-[#888888]">
                                {language === 'es' ? 'Sin datos en este período' : 'No data in this period'}
                            </div>
                        )}
                    </div>

                    {/* Time by Day - Line Chart */}
                    <div className="rounded-3xl p-6" style={neuCardStyle}>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(145deg, #F59E0B, #D97706)',
                                    boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                                }}
                            >
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#444444]">
                                {language === 'es' ? 'Por Día' : 'By Day'}
                            </h2>
                        </div>
                        {dayData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={dayData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#D0D5DC" />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                                    <YAxis stroke="#888888" fontSize={12} />
                                    <Tooltip
                                        formatter={(value: number) => [formatDuration(value), 'Tiempo']}
                                        contentStyle={{
                                            backgroundColor: '#F0F0F3',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.4)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#F59E0B"
                                        strokeWidth={3}
                                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#D97706' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-[#888888]">
                                {language === 'es' ? 'Sin datos en este período' : 'No data in this period'}
                            </div>
                        )}
                    </div>

                    {/* Time by Status - Pie Chart */}
                    <div className="rounded-3xl p-6" style={neuCardStyle}>
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(145deg, #A78BFA, #8B5CF6)',
                                    boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                                }}
                            >
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-[#444444]">
                                {language === 'es' ? 'Por Estado' : 'By Status'}
                            </h2>
                        </div>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name }) => name}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [formatDuration(value), 'Tiempo']}
                                        contentStyle={{
                                            backgroundColor: '#F0F0F3',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.4)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-[#888888]">
                                {language === 'es' ? 'Sin datos en este período' : 'No data in this period'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
