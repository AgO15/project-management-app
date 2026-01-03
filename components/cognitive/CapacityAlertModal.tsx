"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, Brain, ArrowRight } from "lucide-react";

interface CapacityAlertModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message?: string;
    targetState?: string;
}

export function CapacityAlertModal({
    open,
    onOpenChange,
    message,
    targetState
}: CapacityAlertModalProps) {
    const { t } = useLanguage();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent
                className="max-w-md border-0 rounded-3xl p-6"
                style={{
                    backgroundColor: '#E0E5EC',
                    boxShadow: '20px 20px 40px rgba(163, 177, 198, 0.7), -20px -20px 40px rgba(255, 255, 255, 0.6)'
                }}
            >
                <AlertDialogHeader>
                    <div
                        className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                            background: 'linear-gradient(145deg, #F87171, #DC2626)',
                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <AlertDialogTitle className="text-center text-[#444444] text-lg font-semibold">
                        {t('capacityLimit')}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-[#888888]">
                        {message || t('cannotAddMoreProjects')}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Visual explanation */}
                <div className="py-4 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <span
                            className="px-3 py-1 rounded-lg text-red-600"
                            style={{
                                backgroundColor: '#F0F0F3',
                                boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            {t('currentProject')}
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#888888]" />
                        <span
                            className="px-3 py-1 rounded-lg text-emerald-600"
                            style={{
                                backgroundColor: '#F0F0F3',
                                boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            {t('stabilization')} / {t('pause')}
                        </span>
                    </div>

                    <div
                        className="text-center p-4 rounded-2xl"
                        style={{
                            background: 'linear-gradient(145deg, rgba(124,158,188,0.1), rgba(167,139,250,0.1))',
                            boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <Brain className="w-5 h-5 text-[#7C9EBC] mx-auto mb-2" />
                        <p className="text-xs text-[#888888]">
                            {t('cognitiveTheory')}
                        </p>
                    </div>
                </div>

                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel
                        className="flex-1 h-11 rounded-xl border-0 text-[#888888] hover:text-[#444444] font-medium"
                        style={{
                            backgroundColor: '#F0F0F3',
                            boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.5)'
                        }}
                    >
                        {t('understood')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="flex-1 h-11 rounded-xl text-white font-medium border-0"
                        onClick={() => onOpenChange(false)}
                        style={{
                            background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                            boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        {t('reviewProjects')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
