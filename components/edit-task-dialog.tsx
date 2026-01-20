"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { Pencil, AlertCircle, Calendar, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskPeriodicity } from "@/lib/types"
import { WeekDaySelector } from "@/components/WeekDaySelector"

interface Task {
    id: string
    title: string
    description: string | null
    status: string
    priority: string
    due_date: string | null
    periodicity?: TaskPeriodicity
    trigger_if?: string | null
    action_then?: string | null
    custom_days?: string
}

interface EditTaskDialogProps {
    task: Task
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Neumorphic styles
const neuInputStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
    const [loading, setLoading] = useState(false)

    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || "")
    const [priority, setPriority] = useState(task.priority)
    const [dueDate, setDueDate] = useState(task.due_date || "")
    const [status, setStatus] = useState(task.status)
    const [periodicity, setPeriodicity] = useState<TaskPeriodicity>(task.periodicity || "one_time")
    const [customDays, setCustomDays] = useState<string[]>(() => {
        try {
            return task.custom_days ? JSON.parse(task.custom_days) : []
        } catch {
            return []
        }
    })

    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()

    useEffect(() => {
        setTitle(task.title)
        setDescription(task.description || "")
        setPriority(task.priority)
        setDueDate(task.due_date || "")
        setStatus(task.status)
        setPeriodicity(task.periodicity || "one_time")
        try {
            setCustomDays(task.custom_days ? JSON.parse(task.custom_days) : [])
        } catch {
            setCustomDays([])
        }
    }, [task])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from("tasks")
                .update({
                    title: title.trim(),
                    description: description.trim() || null,
                    priority,
                    due_date: dueDate || null,
                    status,
                    periodicity,
                    custom_days: customDays.length > 0 ? JSON.stringify(customDays) : null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", task.id)

            if (error) throw error

            toast({
                title: t('taskUpdated'),
                description: t('changesSuccessfullySaved'),
            })

            onOpenChange(false)
            router.refresh()
        } catch (error) {
            toast({
                title: t('error'),
                description: t('couldNotUpdateTask'),
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "flex flex-col overflow-hidden",
                    "w-[95vw] max-w-md",
                    "max-h-[85vh] sm:max-h-[90vh]",
                    "p-0 border-0 rounded-3xl"
                )}
                style={{
                    backgroundColor: '#E0E5EC',
                    boxShadow: '20px 20px 40px rgba(163, 177, 198, 0.7), -20px -20px 40px rgba(255, 255, 255, 0.6)'
                }}
            >
                {/* Header */}
                <DialogHeader className="flex-shrink-0 p-5 sm:p-6 pb-3">
                    <DialogTitle className="text-[#444444] flex items-center gap-3 text-lg sm:text-xl">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                                boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <Pencil className="w-5 h-5 text-white" />
                        </div>
                        {t('editTask')}
                    </DialogTitle>
                    <DialogDescription className="text-[#888888] text-sm">
                        {t('modifyTaskDetails')}
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label className="text-[#666] text-xs font-medium">
                                {t('title')} *
                            </Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('title')}
                                className="h-11 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm"
                                style={neuInputStyle}
                                required
                            />
                        </div>

                        {/* Priority + Due Date */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Priority */}
                            <div className="space-y-2">
                                <Label className="text-[#666] text-xs font-medium flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {t('priority')}
                                </Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger
                                        className="h-10 rounded-xl border-0 text-[#444444] text-sm"
                                        style={neuInputStyle}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="rounded-xl border-0"
                                        style={{ backgroundColor: '#F0F0F3' }}
                                    >
                                        <SelectItem value="low" className="rounded-lg text-emerald-600">{t('low')}</SelectItem>
                                        <SelectItem value="medium" className="rounded-lg text-amber-600">{t('medium')}</SelectItem>
                                        <SelectItem value="high" className="rounded-lg text-red-500">{t('high')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <Label className="text-[#666] text-xs font-medium flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {t('dueDate')}
                                </Label>
                                <DatePicker
                                    value={dueDate}
                                    onChange={setDueDate}
                                    placeholder="dd/mm/aaaa"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label className="text-[#666] text-xs font-medium">
                                {t('status')}
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger
                                    className="h-10 rounded-xl border-0 text-[#444444] text-sm"
                                    style={neuInputStyle}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent
                                    className="rounded-xl border-0"
                                    style={{ backgroundColor: '#F0F0F3' }}
                                >
                                    <SelectItem value="todo" className="rounded-lg">{t('todo')}</SelectItem>
                                    <SelectItem value="in_progress" className="rounded-lg text-amber-600">{t('inProgress')}</SelectItem>
                                    <SelectItem value="completed" className="rounded-lg text-emerald-600">{t('completed')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Periodicity - shown for If-Then tasks */}
                        {(task.trigger_if || task.action_then) && (
                            <div className="space-y-2">
                                <Label className="text-[#666] text-xs font-medium flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" />
                                    {t('periodicity')}
                                </Label>
                                <Select value={periodicity} onValueChange={(v: TaskPeriodicity) => setPeriodicity(v)}>
                                    <SelectTrigger
                                        className="h-10 rounded-xl border-0 text-[#444444] text-sm"
                                        style={neuInputStyle}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="rounded-xl border-0"
                                        style={{ backgroundColor: '#F0F0F3' }}
                                    >
                                        <SelectItem value="one_time" className="rounded-lg">{t('oneTime')}</SelectItem>
                                        <SelectItem value="daily" className="rounded-lg text-purple-600">{t('daily')}</SelectItem>
                                        <SelectItem value="weekly" className="rounded-lg text-blue-600">{t('weekly')}</SelectItem>
                                        <SelectItem value="custom" className="rounded-lg text-amber-600">{t('custom')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Custom Days Selector - shown when periodicity is weekly or custom */}
                        {(task.trigger_if || task.action_then) && (periodicity === 'weekly' || periodicity === 'custom') && (
                            <div className="space-y-2">
                                <Label className="text-[#666] text-xs font-medium">
                                    {periodicity === 'weekly' ? t('weeklyOn') : t('customDays')}
                                </Label>
                                <WeekDaySelector
                                    selectedDays={customDays}
                                    onChange={setCustomDays}
                                />
                                {customDays.length === 0 && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {t('selectAtLeastOneDay')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-[#666] text-xs font-medium">
                                {t('description')}
                            </Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('description')}
                                rows={3}
                                className="rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm resize-none"
                                style={neuInputStyle}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 sm:p-6 pt-4 flex-shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-11 rounded-xl text-[#888888] hover:text-[#444444] hover:bg-[#F0F0F3] font-medium"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !title.trim()}
                        className="flex-1 h-11 rounded-xl text-white font-medium border-0"
                        onClick={handleSubmit}
                        style={{
                            background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {loading ? t('saving') : t('save')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
