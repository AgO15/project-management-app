"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ListChecks, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface ChecklistItem {
    id: string;
    content: string;
    is_completed: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}

interface TaskChecklistProps {
    taskId: string;
    items: ChecklistItem[];
}

// Neumorphic styles matching task-list.tsx
const neuInsetStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: 'inset 2px 2px 4px rgba(163, 177, 198, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.7)',
};

const neuButtonStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.5)',
};

export function TaskChecklist({ taskId, items }: TaskChecklistProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newItemContent, setNewItemContent] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();

    const completedCount = items.filter(item => item.is_completed).length;
    const totalCount = items.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const createItem = async () => {
        if (!newItemContent.trim()) return;
        setLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const maxPosition = items.length > 0 ? Math.max(...items.map(i => i.position)) + 1 : 0;

            const { error } = await supabase.from("checklist_items").insert({
                content: newItemContent.trim(),
                task_id: taskId,
                user_id: user.id,
                position: maxPosition,
                is_completed: false,
            });

            if (error) throw error;

            toast({
                title: t('checklist'),
                description: t('checklistItemAdded')
            });
            setNewItemContent("");
            setIsAdding(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error creating checklist item:", error);
            toast({
                title: t('error'),
                description: error.message || t('couldNotCreateChecklistItem'),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = async (itemId: string, currentState: boolean) => {
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from("checklist_items")
                .update({
                    is_completed: !currentState,
                    updated_at: new Date().toISOString()
                })
                .eq("id", itemId);

            if (error) throw error;

            router.refresh();
        } catch (error: any) {
            toast({
                title: t('error'),
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const deleteItem = async (itemId: string) => {
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from("checklist_items")
                .delete()
                .eq("id", itemId);

            if (error) throw error;

            toast({
                title: t('checklist'),
                description: t('checklistItemDeleted')
            });
            router.refresh();
        } catch (error: any) {
            toast({
                title: t('error'),
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newItemContent.trim()) {
            createItem();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewItemContent("");
        }
    };

    const sortedItems = [...items].sort((a, b) => a.position - b.position);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
                >
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-[#7C9EBC]" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-[#7C9EBC]" />
                    )}
                    <ListChecks className="h-4 w-4 text-[#7C9EBC]" />
                    <span className="text-sm text-[#666]">{t('checklist')}</span>
                    {totalCount > 0 && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                "text-xs px-2 py-0.5 rounded-lg",
                                completedCount === totalCount
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-[#E0E5EC] text-[#666]"
                            )}
                            style={completedCount !== totalCount ? neuInsetStyle : undefined}
                        >
                            {completedCount}/{totalCount}
                        </Badge>
                    )}
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3">
                <div className="space-y-3 pl-6">
                    {/* Progress bar */}
                    {totalCount > 0 && (
                        <div
                            className="h-2 rounded-full overflow-hidden"
                            style={neuInsetStyle}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-300 ease-out"
                                style={{
                                    width: `${progressPercent}%`,
                                    background: 'linear-gradient(145deg, #34D399, #10B981)'
                                }}
                            />
                        </div>
                    )}

                    {/* Add new item */}
                    {!isAdding ? (
                        <Button
                            onClick={() => setIsAdding(true)}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-[#7C9EBC] hover:text-[#5A7C9A] hover:bg-[#F0F0F3] rounded-xl px-3 py-2"
                            style={neuButtonStyle}
                        >
                            <Plus className="h-3 w-3" />
                            {t('addChecklistItem')}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Input
                                value={newItemContent}
                                onChange={(e) => setNewItemContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('checklistItemPlaceholder')}
                                className="flex-1 h-9 text-sm rounded-xl border-0 text-[#444]"
                                style={neuInsetStyle}
                                autoFocus
                                disabled={loading}
                            />
                            <Button
                                onClick={createItem}
                                disabled={loading || !newItemContent.trim()}
                                size="sm"
                                className="h-9 rounded-xl text-white"
                                style={{
                                    background: 'linear-gradient(145deg, #7C9EBC, #A78BFA)',
                                    boxShadow: '3px 3px 6px rgba(163, 177, 198, 0.5), -3px -3px 6px rgba(255, 255, 255, 0.5)'
                                }}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => { setIsAdding(false); setNewItemContent(""); }}
                                variant="ghost"
                                size="sm"
                                className="h-9 rounded-xl text-[#888] hover:text-[#444] hover:bg-[#F0F0F3]"
                            >
                                {t('cancel')}
                            </Button>
                        </div>
                    )}

                    {/* Checklist items */}
                    {sortedItems.length > 0 ? (
                        <div className="space-y-2">
                            {sortedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl transition-all group",
                                        item.is_completed ? "opacity-70" : ""
                                    )}
                                    style={neuInsetStyle}
                                >
                                    <div
                                        className="flex items-center justify-center w-5 h-5 rounded-lg cursor-pointer flex-shrink-0"
                                        onClick={() => toggleItem(item.id, item.is_completed)}
                                        style={item.is_completed ? {
                                            background: 'linear-gradient(145deg, #34D399, #10B981)',
                                            boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.4)'
                                        } : {
                                            backgroundColor: '#E0E5EC',
                                            boxShadow: 'inset 1px 1px 2px rgba(163, 177, 198, 0.4), inset -1px -1px 2px rgba(255, 255, 255, 0.7)'
                                        }}
                                    >
                                        {item.is_completed && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    <span
                                        className={cn(
                                            "flex-1 text-sm transition-all",
                                            item.is_completed
                                                ? "line-through text-[#aaa]"
                                                : "text-[#444]"
                                        )}
                                    >
                                        {item.content}
                                    </span>

                                    <Button
                                        onClick={() => deleteItem(item.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#888] hover:text-red-500 hover:bg-transparent"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : !isAdding && (
                        <p className="text-sm text-[#888] italic pl-2">
                            {t('noChecklistItems')}
                        </p>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
