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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import { Zap, ArrowRight, Brain, AlertCircle, Lightbulb, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface IfThenTaskDialogProps {
    children: React.ReactNode
    projectId: string
    projectRepresentation?: string | null
}

const MAX_ACTION_LENGTH = 100

// Neumorphic styles
const neuInputStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
}

export function IfThenTaskDialog({ children, projectId, projectRepresentation }: IfThenTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("medium")
    const [dueDate, setDueDate] = useState("")

    const [triggerIf, setTriggerIf] = useState("")
    const [actionThen, setActionThen] = useState("")
    const [isMicroObjective, setIsMicroObjective] = useState(true)
    const [periodicity, setPeriodicity] = useState<"one_time" | "daily" | "weekly" | "custom">("one_time")

    const router = useRouter()
    const { toast } = useToast()
    const { t, language } = useLanguage()

    useEffect(() => {
        if (triggerIf && actionThen) {
            const ifWord = language === 'es' ? 'Si' : 'If'
            setTitle(`${ifWord} ${triggerIf} → ${actionThen}`)
        }
    }, [triggerIf, actionThen, language])

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setPriority("medium")
        setDueDate("")
        setTriggerIf("")
        setActionThen("")
        setIsMicroObjective(true)
        setPeriodicity("one_time")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!actionThen.trim()) return

        setLoading(true)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const finalTitle = title.trim() || actionThen.trim()

            const { error } = await supabase.from("tasks").insert({
                title: finalTitle,
                description: description.trim() || null,
                priority,
                due_date: dueDate || null,
                project_id: projectId,
                user_id: user.id,
                trigger_if: triggerIf.trim() || null,
                action_then: actionThen.trim(),
                is_micro_objective: isMicroObjective,
                periodicity,
            })

            if (error) throw error

            toast({
                title: t('intentionCreated'),
                description: t('microObjectiveScheduled'),
            })

            setOpen(false)
            resetForm()
            router.refresh()
        } catch (error) {
            console.error("Task creation error:", error)
            toast({
                title: t('error'),
                description: t('couldNotCreateTask'),
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const actionThenLength = actionThen.length
    const isActionTooLong = actionThenLength > MAX_ACTION_LENGTH

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className={cn(
                    "flex flex-col overflow-hidden",
                    "w-[95vw] max-w-lg",
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
                                background: 'linear-gradient(145deg, #F59E0B, #D97706)',
                                boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        {t('newIfThenIntention')}
                    </DialogTitle>
                    <DialogDescription className="text-[#888888] text-sm">
                        {t('ifThenPattern')}
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-6">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                        {/* Project Representation Primer */}
                        {projectRepresentation && (
                            <div
                                className="p-3 rounded-2xl"
                                style={{
                                    backgroundColor: '#F0F0F3',
                                    boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
                                }}
                            >
                                <div className="flex items-start gap-2">
                                    <Brain className="w-4 h-4 text-[#7C9EBC] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-[#888888] mb-1">{t('projectRepresents')}</p>
                                        <p className="text-sm text-[#444444] italic">"{projectRepresentation}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* If-Then Mad-libs Style Input */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#7C9EBC] font-medium text-xs uppercase tracking-wide">
                                <Lightbulb className="w-4 h-4" />
                                {t('implementationIntention')}
                            </div>

                            {/* SI (Trigger) */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="px-3 py-1.5 rounded-xl text-white font-bold text-sm"
                                        style={{
                                            background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                                            boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                                        }}
                                    >
                                        {t('ifTrigger')}
                                    </div>
                                    <span className="text-[#888888] text-xs">({t('contextualTrigger')})</span>
                                </div>
                                <Input
                                    value={triggerIf}
                                    onChange={(e) => setTriggerIf(e.target.value)}
                                    placeholder={t('triggerPlaceholder')}
                                    className="h-11 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm"
                                    style={neuInputStyle}
                                />
                                <p className="text-xs text-[#888888]">
                                    {t('triggerTip')}
                                </p>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center py-1">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor: '#E0E5EC',
                                        boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.6)'
                                    }}
                                >
                                    <ArrowRight className="w-5 h-5 text-[#7C9EBC]" />
                                </div>
                            </div>

                            {/* ENTONCES (Action) */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="px-3 py-1.5 rounded-xl text-white font-bold text-sm"
                                        style={{
                                            background: 'linear-gradient(145deg, #34D399, #10B981)',
                                            boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                                        }}
                                    >
                                        {t('thenAction')}
                                    </div>
                                    <span className="text-[#888888] text-xs">({t('atomicAction')})</span>
                                </div>
                                <Input
                                    value={actionThen}
                                    onChange={(e) => setActionThen(e.target.value)}
                                    placeholder={t('actionPlaceholder')}
                                    className={cn(
                                        "h-11 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm",
                                        isActionTooLong && "ring-2 ring-red-400"
                                    )}
                                    style={neuInputStyle}
                                    required
                                />
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-[#888888]">
                                        {t('keepActionBrief')} ({t('maxCharacters')}: {MAX_ACTION_LENGTH})
                                    </p>
                                    <span className={cn(
                                        "text-xs",
                                        isActionTooLong ? "text-red-500" : "text-[#888888]"
                                    )}>
                                        {actionThenLength}/{MAX_ACTION_LENGTH}
                                    </span>
                                </div>
                                {isActionTooLong && (
                                    <div className="flex items-center gap-1 text-red-500 text-xs">
                                        <AlertCircle className="w-3 h-3" />
                                        {t('actionTooLong')}
                                    </div>
                                )}
                            </div>

                            {/* Preview */}
                            {triggerIf && actionThen && !isActionTooLong && (
                                <div
                                    className="p-3 rounded-2xl"
                                    style={{
                                        background: 'linear-gradient(145deg, rgba(124,158,188,0.1), rgba(167,139,250,0.1))',
                                        boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.3)'
                                    }}
                                >
                                    <p className="text-xs text-[#888888] mb-2">{t('preview')}:</p>
                                    <p className="text-sm text-[#444444]">
                                        <span className="text-[#7C9EBC] font-bold">{t('ifTrigger')}</span> {triggerIf}{" "}
                                        <span className="text-emerald-500 font-bold">→ {t('thenAction')}</span> {actionThen}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-4 pt-4 border-t border-[rgba(163,177,198,0.3)]">
                            <div className="text-[#888888] text-xs uppercase tracking-wide">
                                {t('additionalDetails')} ({t('optional')})
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[#666] text-xs font-medium">{t('priority')}</Label>
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
                                            <SelectItem value="low" className="rounded-lg">{t('low')}</SelectItem>
                                            <SelectItem value="medium" className="rounded-lg">{t('medium')}</SelectItem>
                                            <SelectItem value="high" className="rounded-lg">{t('high')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[#666] text-xs font-medium flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" />
                                        {t('periodicity')}
                                    </Label>
                                    <Select value={periodicity} onValueChange={(v: "one_time" | "daily" | "weekly" | "custom") => setPeriodicity(v)}>
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
                                            <SelectItem value="daily" className="rounded-lg">{t('daily')}</SelectItem>
                                            <SelectItem value="weekly" className="rounded-lg">{t('weekly')}</SelectItem>
                                            <SelectItem value="custom" className="rounded-lg">{t('custom')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[#666] text-xs font-medium">{t('dueDate')}</Label>
                                    <DatePicker
                                        value={dueDate}
                                        onChange={setDueDate}
                                        placeholder="dd/mm/aaaa"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[#666] text-xs font-medium">{t('additionalNotes')}</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('notesPlaceholder')}
                                    rows={2}
                                    className="rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm resize-none"
                                    style={neuInputStyle}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 sm:p-6 pt-4 flex-shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="flex-1 h-11 rounded-xl text-[#888888] hover:text-[#444444] hover:bg-[#F0F0F3] font-medium"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !actionThen.trim() || isActionTooLong}
                        className="flex-1 h-11 rounded-xl text-white font-medium border-0"
                        onClick={handleSubmit}
                        style={{
                            background: 'linear-gradient(145deg, #34D399, #10B981)',
                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {loading ? t('creating') : t('createIntention')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
