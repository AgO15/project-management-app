"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"
import {
    DollarSign,
    Calculator,
    TrendingUp,
    Plus,
    Trash2,
    Wallet,
    PiggyBank,
    Home,
    ShoppingCart,
    Target,
    AlertCircle,
    Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { IncomeAllocation } from "@/lib/types"

interface IncomeRegistrationDialogProps {
    children: React.ReactNode
    projectId: string
}

// Default allocation categories with icons
const DEFAULT_CATEGORIES = [
    { name: "Ahorros", icon: PiggyBank, color: "#10B981" },
    { name: "Inversión Binance", icon: TrendingUp, color: "#F59E0B" },
    { name: "Gastos Fijos", icon: Home, color: "#6366F1" },
    { name: "Gastos Variables", icon: ShoppingCart, color: "#EC4899" },
    { name: "Metas", icon: Target, color: "#8B5CF6" },
]

// Neumorphic styles
const neuInputStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
}

const neuCardStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: '6px 6px 12px rgba(163, 177, 198, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.5)',
}

export function IncomeRegistrationDialog({ children, projectId }: IncomeRegistrationDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form state
    const [periodStart, setPeriodStart] = useState("")
    const [periodEnd, setPeriodEnd] = useState("")
    const [amountBs, setAmountBs] = useState("")
    const [rateBcv, setRateBcv] = useState("")
    const [rateBinance, setRateBinance] = useState("")
    const [notes, setNotes] = useState("")

    // Allocations
    const [allocations, setAllocations] = useState<IncomeAllocation[]>([
        { category: "Ahorros", percentage: 20, amount_usd: 0 },
        { category: "Inversión Binance", percentage: 30, amount_usd: 0 },
        { category: "Gastos Fijos", percentage: 30, amount_usd: 0 },
        { category: "Gastos Variables", percentage: 15, amount_usd: 0 },
        { category: "Metas", percentage: 5, amount_usd: 0 },
    ])

    // Calculated values
    const [amountUsdBcv, setAmountUsdBcv] = useState(0)
    const [amountUsdBinance, setAmountUsdBinance] = useState(0)

    const router = useRouter()
    const { toast } = useToast()
    const { t, language } = useLanguage()

    // Calculate USD values when inputs change
    const calculateAmounts = useCallback(() => {
        const bs = parseFloat(amountBs) || 0
        const bcv = parseFloat(rateBcv) || 0
        const binance = parseFloat(rateBinance) || 0

        const usdBcv = bcv > 0 ? bs / bcv : 0
        const usdBinance = binance > 0 ? bs / binance : 0

        setAmountUsdBcv(usdBcv)
        setAmountUsdBinance(usdBinance)

        // Update allocation amounts based on Binance rate
        setAllocations(prev => prev.map(alloc => ({
            ...alloc,
            amount_usd: (alloc.percentage / 100) * usdBinance
        })))
    }, [amountBs, rateBcv, rateBinance])

    useEffect(() => {
        calculateAmounts()
    }, [calculateAmounts])

    // Get total percentage
    const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0)
    const isValidTotal = totalPercentage === 100

    // Add new allocation
    const addAllocation = () => {
        setAllocations(prev => [
            ...prev,
            { category: "Nueva Categoría", percentage: 0, amount_usd: 0 }
        ])
    }

    // Remove allocation
    const removeAllocation = (index: number) => {
        setAllocations(prev => prev.filter((_, i) => i !== index))
    }

    // Update allocation
    const updateAllocation = (index: number, field: keyof IncomeAllocation, value: string | number) => {
        setAllocations(prev => prev.map((alloc, i) => {
            if (i !== index) return alloc

            const updated = { ...alloc, [field]: value }

            // Recalculate amount if percentage changed
            if (field === 'percentage') {
                updated.amount_usd = (Number(value) / 100) * amountUsdBinance
            }

            return updated
        }))
    }

    // Reset form
    const resetForm = () => {
        setPeriodStart("")
        setPeriodEnd("")
        setAmountBs("")
        setRateBcv("")
        setRateBinance("")
        setNotes("")
        setAllocations([
            { category: "Ahorros", percentage: 20, amount_usd: 0 },
            { category: "Inversión Binance", percentage: 30, amount_usd: 0 },
            { category: "Gastos Fijos", percentage: 30, amount_usd: 0 },
            { category: "Gastos Variables", percentage: 15, amount_usd: 0 },
            { category: "Metas", percentage: 5, amount_usd: 0 },
        ])
    }

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!amountBs || !rateBcv || !rateBinance || !periodStart || !periodEnd) {
            toast({
                title: language === 'es' ? "Campos requeridos" : "Required fields",
                description: language === 'es'
                    ? "Por favor complete todos los campos obligatorios"
                    : "Please fill all required fields",
                variant: "destructive",
            })
            return
        }

        if (!isValidTotal) {
            toast({
                title: language === 'es' ? "Porcentaje inválido" : "Invalid percentage",
                description: language === 'es'
                    ? "Los porcentajes deben sumar exactamente 100%"
                    : "Percentages must add up to exactly 100%",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase.from("income_records").insert({
                user_id: user.id,
                project_id: projectId,
                period_start: periodStart,
                period_end: periodEnd,
                amount_bs: parseFloat(amountBs),
                rate_bcv: parseFloat(rateBcv),
                rate_binance: parseFloat(rateBinance),
                amount_usd_bcv: amountUsdBcv,
                amount_usd_binance: amountUsdBinance,
                allocations: allocations,
                notes: notes.trim() || null,
            })

            if (error) throw error

            toast({
                title: language === 'es' ? "Ingreso registrado" : "Income registered",
                description: language === 'es'
                    ? `${amountBs} Bs → $${amountUsdBinance.toFixed(2)} (Binance)`
                    : `${amountBs} Bs → $${amountUsdBinance.toFixed(2)} (Binance)`,
            })

            setOpen(false)
            resetForm()
            router.refresh()
        } catch (error) {
            console.error("Income registration error:", error)
            toast({
                title: language === 'es' ? "Error" : "Error",
                description: language === 'es'
                    ? "No se pudo registrar el ingreso"
                    : "Could not register income",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Get category icon
    const getCategoryIcon = (categoryName: string) => {
        const category = DEFAULT_CATEGORIES.find(c =>
            categoryName.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
        )
        return category ? category.icon : Wallet
    }

    // Get category color
    const getCategoryColor = (categoryName: string) => {
        const category = DEFAULT_CATEGORIES.find(c =>
            categoryName.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
        )
        return category?.color || "#7C9EBC"
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className={cn(
                    "flex flex-col overflow-hidden",
                    "w-[95vw] max-w-2xl",
                    "max-h-[90vh]",
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
                                background: 'linear-gradient(145deg, #10B981, #059669)',
                                boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        {language === 'es' ? 'Registrar Ingreso' : 'Register Income'}
                    </DialogTitle>
                    <DialogDescription className="text-[#888888] text-sm">
                        {language === 'es'
                            ? 'Registra tu ingreso y divide automáticamente en categorías'
                            : 'Register your income and automatically divide into categories'
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Period Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#7C9EBC] font-medium text-xs uppercase tracking-wide">
                                <Calculator className="w-4 h-4" />
                                {language === 'es' ? 'Período' : 'Period'}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[#666] text-xs">{language === 'es' ? 'Desde' : 'From'}</Label>
                                    <Input
                                        type="date"
                                        value={periodStart}
                                        onChange={(e) => setPeriodStart(e.target.value)}
                                        className="h-11 rounded-xl border-0 text-[#444444] text-sm"
                                        style={neuInputStyle}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[#666] text-xs">{language === 'es' ? 'Hasta' : 'To'}</Label>
                                    <Input
                                        type="date"
                                        value={periodEnd}
                                        onChange={(e) => setPeriodEnd(e.target.value)}
                                        className="h-11 rounded-xl border-0 text-[#444444] text-sm"
                                        style={neuInputStyle}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Amount and Rates Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#7C9EBC] font-medium text-xs uppercase tracking-wide">
                                <Wallet className="w-4 h-4" />
                                {language === 'es' ? 'Monto y Tasas' : 'Amount & Rates'}
                            </div>

                            {/* Amount in Bs */}
                            <div className="space-y-1">
                                <Label className="text-[#666] text-xs">{language === 'es' ? 'Monto en Bolívares' : 'Amount in Bolivares'}</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={amountBs}
                                        onChange={(e) => setAmountBs(e.target.value)}
                                        placeholder="13000"
                                        className="h-12 rounded-xl border-0 text-[#444444] text-lg font-medium pl-12"
                                        style={neuInputStyle}
                                        required
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888] font-medium">Bs</span>
                                </div>
                            </div>

                            {/* Exchange Rates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[#666] text-xs">{language === 'es' ? 'Tasa BCV' : 'BCV Rate'}</Label>
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        value={rateBcv}
                                        onChange={(e) => setRateBcv(e.target.value)}
                                        placeholder="304.50"
                                        className="h-11 rounded-xl border-0 text-[#444444] text-sm"
                                        style={neuInputStyle}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[#666] text-xs">{language === 'es' ? 'Tasa Binance' : 'Binance Rate'}</Label>
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        value={rateBinance}
                                        onChange={(e) => setRateBinance(e.target.value)}
                                        placeholder="853.50"
                                        className="h-11 rounded-xl border-0 text-[#444444] text-sm"
                                        style={neuInputStyle}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Calculated Values Display */}
                            {amountBs && rateBcv && rateBinance && (
                                <div
                                    className="p-4 rounded-2xl grid grid-cols-2 gap-4"
                                    style={neuCardStyle}
                                >
                                    <div className="text-center">
                                        <p className="text-xs text-[#888] mb-1">USD (BCV)</p>
                                        <p className="text-xl font-bold text-[#6366F1]">
                                            ${amountUsdBcv.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-[#888] mb-1">USD (Binance)</p>
                                        <p className="text-xl font-bold text-[#10B981]">
                                            ${amountUsdBinance.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Allocations Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[#7C9EBC] font-medium text-xs uppercase tracking-wide">
                                    <TrendingUp className="w-4 h-4" />
                                    {language === 'es' ? 'División de Gastos' : 'Expense Division'}
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg",
                                    isValidTotal
                                        ? "text-emerald-600 bg-emerald-100"
                                        : "text-red-600 bg-red-100"
                                )}>
                                    {isValidTotal ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {totalPercentage}%
                                </div>
                            </div>

                            <div className="space-y-2">
                                {allocations.map((alloc, index) => {
                                    const IconComponent = getCategoryIcon(alloc.category)
                                    const color = getCategoryColor(alloc.category)

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-3 rounded-xl"
                                            style={{
                                                backgroundColor: '#F0F0F3',
                                                boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
                                            }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: `${color}20` }}
                                            >
                                                <IconComponent className="w-4 h-4" style={{ color }} />
                                            </div>

                                            <Input
                                                value={alloc.category}
                                                onChange={(e) => updateAllocation(index, 'category', e.target.value)}
                                                className="flex-1 h-8 rounded-lg border-0 text-[#444] text-sm bg-transparent"
                                                placeholder="Categoría"
                                            />

                                            <div className="flex items-center gap-1 w-20">
                                                <Input
                                                    type="number"
                                                    value={alloc.percentage}
                                                    onChange={(e) => updateAllocation(index, 'percentage', Number(e.target.value))}
                                                    className="w-14 h-8 rounded-lg border-0 text-[#444] text-sm text-center bg-white/50"
                                                    min="0"
                                                    max="100"
                                                />
                                                <span className="text-xs text-[#888]">%</span>
                                            </div>

                                            <div className="w-20 text-right">
                                                <span className="text-sm font-medium" style={{ color }}>
                                                    ${alloc.amount_usd.toFixed(2)}
                                                </span>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAllocation(index)}
                                                className="w-8 h-8 p-0 text-[#888] hover:text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )
                                })}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={addAllocation}
                                    className="w-full h-10 rounded-xl text-[#7C9EBC] hover:text-[#444] hover:bg-[#F0F0F3] border-2 border-dashed border-[#ccc]"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {language === 'es' ? 'Agregar Categoría' : 'Add Category'}
                                </Button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label className="text-[#666] text-xs">
                                {language === 'es' ? 'Notas (opcional)' : 'Notes (optional)'}
                            </Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={language === 'es'
                                    ? "Cualquier información adicional..."
                                    : "Any additional information..."
                                }
                                rows={2}
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
                        onClick={() => setOpen(false)}
                        className="flex-1 h-11 rounded-xl text-[#888888] hover:text-[#444444] hover:bg-[#F0F0F3] font-medium"
                    >
                        {language === 'es' ? 'Cancelar' : 'Cancel'}
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !isValidTotal || !amountBs || !rateBcv || !rateBinance}
                        className="flex-1 h-11 rounded-xl text-white font-medium border-0"
                        onClick={handleSubmit}
                        style={{
                            background: 'linear-gradient(145deg, #10B981, #059669)',
                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {loading
                            ? (language === 'es' ? 'Guardando...' : 'Saving...')
                            : (language === 'es' ? 'Registrar Ingreso' : 'Register Income')
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
