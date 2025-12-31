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
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-black border-red-500/30 max-w-md">
                <AlertDialogHeader>
                    <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                    <AlertDialogTitle className="text-center text-red-400 font-mono text-lg">
                        Capacidad Cognitiva al Límite
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        {message || (
                            <span className="text-muted-foreground font-mono text-sm">
                                No puedes añadir más proyectos en este estado.
                            </span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Visual explanation */}
                <div className="py-4 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-mono">
                        <span className="text-red-400">Proyecto actual</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-green-400">Estabilización / Pausa</span>
                    </div>

                    <div className="text-center p-3 rounded-lg bg-green-500/5 border border-[rgba(34,197,94,0.2)]">
                        <Brain className="w-5 h-5 text-green-400 mx-auto mb-2" />
                        <p className="text-xs text-green-500/70 font-mono">
                            Basado en la teoría de conservación de recursos cognitivos,
                            limitar el enfoque activo previene el agotamiento y mejora los resultados.
                        </p>
                    </div>
                </div>

                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="flex-1 border-[rgba(34,197,94,0.3)] text-green-400 hover:bg-green-500/10 font-mono">
                        Entendido
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono"
                        onClick={() => onOpenChange(false)}
                    >
                        Revisar Proyectos
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
