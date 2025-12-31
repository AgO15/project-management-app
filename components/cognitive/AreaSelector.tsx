"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Plus, Loader2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Area {
    id: string;
    name: string;
    vision_statement: string | null;
}

interface AreaSelectorProps {
    selectedArea: Area | null;
    onSelectArea: (area: Area | null) => void;
    className?: string;
}

// Neumorphic style constants
const neuInputStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
};

const neuButtonStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.6)',
};

export function AreaSelector({ selectedArea, onSelectArea, className }: AreaSelectorProps) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showNewAreaDialog, setShowNewAreaDialog] = useState(false);
    const [newAreaName, setNewAreaName] = useState("");
    const [newAreaVision, setNewAreaVision] = useState("");
    const [isCreatingArea, setIsCreatingArea] = useState(false);

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/areas/list");
            if (!response.ok) throw new Error("Failed to fetch areas");
            const data = await response.json();
            setAreas(data.areas || []);
        } catch (error) {
            console.error("Error fetching areas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateArea = async () => {
        if (!newAreaName.trim()) return;

        setIsCreatingArea(true);
        try {
            const response = await fetch("/api/areas/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newAreaName.trim(),
                    vision_statement: newAreaVision.trim() || null
                }),
            });

            if (!response.ok) throw new Error("Failed to create area");

            const data = await response.json();
            const newArea = data.area;

            setAreas([...areas, newArea]);
            onSelectArea(newArea);
            setNewAreaName("");
            setNewAreaVision("");
            setShowNewAreaDialog(false);
            setIsOpen(false);
        } catch (error) {
            console.error("Error creating area:", error);
        } finally {
            setIsCreatingArea(false);
        }
    };

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={isOpen}
                        className={cn(
                            "w-full justify-between overflow-hidden rounded-xl border-0",
                            "text-[#444444] hover:text-[#333] transition-all duration-200",
                            className
                        )}
                        style={neuInputStyle}
                    >
                        <span className="flex-1 min-w-0 flex items-center gap-2">
                            {selectedArea ? (
                                <>
                                    <Target className="w-4 h-4 text-[#7C9EBC] flex-shrink-0" />
                                    <span className="truncate text-sm">{selectedArea.name}</span>
                                </>
                            ) : (
                                <span className="text-[#aaa] truncate text-sm">Seleccionar área...</span>
                            )}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#888]" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-full p-0 rounded-xl border-0 overflow-hidden"
                    style={{ backgroundColor: '#F0F0F3', boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)' }}
                >
                    <div className="p-2 border-b border-[rgba(163,177,198,0.3)]">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-[#7C9EBC] hover:text-[#5A7C9A] hover:bg-[#E0E5EC] rounded-lg"
                            onClick={() => {
                                setShowNewAreaDialog(true);
                                setIsOpen(false);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Área de Vida
                        </Button>
                    </div>
                    <div>
                        {selectedArea && (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-[#888888] hover:text-[#444] hover:bg-[#E0E5EC] border-b border-[rgba(163,177,198,0.2)] rounded-none"
                                onClick={() => {
                                    onSelectArea(null);
                                    setIsOpen(false);
                                }}
                            >
                                Sin área asignada
                            </Button>
                        )}

                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-[#888888]">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                                Cargando áreas...
                            </div>
                        ) : areas.length === 0 ? (
                            <div className="p-4 text-center text-sm text-[#888888]">
                                No hay áreas creadas
                            </div>
                        ) : (
                            <div className="max-h-60 overflow-y-auto">
                                {areas.map((area) => (
                                    <Button
                                        key={area.id}
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start rounded-none",
                                            "text-[#444444] hover:text-[#333] hover:bg-[#E0E5EC]",
                                            selectedArea?.id === area.id && "bg-[#E0E5EC]"
                                        )}
                                        onClick={() => {
                                            onSelectArea(area);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <Target className="w-3 h-3 mr-2 text-[#7C9EBC]" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm">{area.name}</span>
                                            {area.vision_statement && (
                                                <span className="text-xs text-[#888] truncate max-w-[200px]">
                                                    {area.vision_statement}
                                                </span>
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <Dialog open={showNewAreaDialog} onOpenChange={setShowNewAreaDialog}>
                <DialogContent
                    className="rounded-3xl border-0 p-0"
                    style={{ backgroundColor: '#E0E5EC', boxShadow: '20px 20px 40px rgba(163, 177, 198, 0.7), -20px -20px 40px rgba(255, 255, 255, 0.6)' }}
                >
                    <DialogHeader className="p-5 pb-3">
                        <DialogTitle className="text-[#444444] flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                                    boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.4), -3px -3px 6px rgba(255, 255, 255, 0.4)'
                                }}
                            >
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            Nueva Área de Vida
                        </DialogTitle>
                        <DialogDescription className="text-[#888888]">
                            Las áreas representan los dominios fundamentales de tu vida (ej: Salud, Carrera, Relaciones).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 px-5 pb-2">
                        <div className="space-y-2">
                            <Label className="text-[#444444] text-sm font-medium">Nombre del Área</Label>
                            <Input
                                placeholder="Ej: Salud y Bienestar"
                                value={newAreaName}
                                onChange={(e) => setNewAreaName(e.target.value)}
                                className="h-11 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa]"
                                style={neuInputStyle}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[#444444] text-sm font-medium">Visión a Largo Plazo (Opcional)</Label>
                            <Textarea
                                placeholder="¿Cómo te ves en esta área en 5 años?"
                                value={newAreaVision}
                                onChange={(e) => setNewAreaVision(e.target.value)}
                                className="rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] min-h-[80px] resize-none"
                                style={neuInputStyle}
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-5 pt-3 gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowNewAreaDialog(false);
                                setNewAreaName("");
                                setNewAreaVision("");
                            }}
                            disabled={isCreatingArea}
                            className="flex-1 h-11 rounded-xl text-[#888888] hover:text-[#444444] hover:bg-[#F0F0F3]"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateArea}
                            disabled={!newAreaName.trim() || isCreatingArea}
                            className="flex-1 h-11 rounded-xl text-white border-0"
                            style={{
                                background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                                boxShadow: '4px 4px 8px rgba(163, 177, 198, 0.5), -4px -4px 8px rgba(255, 255, 255, 0.4)'
                            }}
                        >
                            {isCreatingArea && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Área
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
