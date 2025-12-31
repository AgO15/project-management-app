"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    value?: string; // ISO format: YYYY-MM-DD
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function DatePicker({
    value,
    onChange,
    placeholder = "dd/mm/aaaa",
    className,
    disabled = false,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    // Convert ISO value to Date object
    const selectedDate = React.useMemo(() => {
        if (!value) return undefined;
        const date = new Date(value + "T00:00:00");
        return isValid(date) ? date : undefined;
    }, [value]);

    // Sync input value with selected date
    React.useEffect(() => {
        if (selectedDate) {
            setInputValue(format(selectedDate, "dd/MM/yyyy"));
        } else {
            setInputValue("");
        }
    }, [selectedDate]);

    // Handle calendar date selection
    const handleSelectDate = (date: Date | undefined) => {
        if (date) {
            const isoValue = format(date, "yyyy-MM-dd");
            onChange?.(isoValue);
        } else {
            onChange?.("");
        }
        setOpen(false);
    };

    // Handle manual input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setInputValue(raw);

        // Try to parse the date in dd/MM/yyyy format
        if (raw.length === 10) {
            const parsed = parse(raw, "dd/MM/yyyy", new Date());
            if (isValid(parsed)) {
                const isoValue = format(parsed, "yyyy-MM-dd");
                onChange?.(isoValue);
            }
        } else if (raw === "") {
            onChange?.("");
        }
    };

    // Handle input blur - validate and format
    const handleInputBlur = () => {
        if (inputValue && inputValue.length > 0 && inputValue.length < 10) {
            // Incomplete date - reset to selected date or clear
            if (selectedDate) {
                setInputValue(format(selectedDate, "dd/MM/yyyy"));
            } else {
                setInputValue("");
            }
        }
    };

    return (
        <div className={cn("relative", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <div className="flex items-center">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(
                            "h-9 pr-10 bg-black/50 border-[rgba(34,197,94,0.3)] text-green-400 font-mono placeholder:text-green-500/40 text-sm",
                            "focus:ring-1 focus:ring-green-500/50"
                        )}
                    />
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            className={cn(
                                "absolute right-0 h-9 w-9 p-0",
                                "text-green-400/70 hover:text-green-400 hover:bg-green-500/10",
                                "border-l border-[rgba(34,197,94,0.2)]"
                            )}
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                </div>

                <PopoverContent
                    className="w-auto p-0 bg-black border-[rgba(34,197,94,0.3)]"
                    align="end"
                    sideOffset={4}
                >
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelectDate}
                        locale={es}
                        className="[&_.rdp-day]:text-green-400 [&_.rdp-day_button]:text-green-400"
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-mono text-green-400",
                            nav: "space-x-1 flex items-center",
                            nav_button: cn(
                                "h-7 w-7 bg-transparent p-0",
                                "text-green-400 hover:text-green-300 hover:bg-green-500/10",
                                "rounded-md border border-[rgba(34,197,94,0.2)]"
                            ),
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-green-500/60 rounded-md w-8 font-mono text-[0.7rem] text-center",
                            row: "flex w-full mt-2",
                            cell: cn(
                                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                                "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                            ),
                            day: cn(
                                "h-8 w-8 p-0 font-mono text-sm",
                                "text-green-400 hover:bg-green-500/20 hover:text-green-300",
                                "rounded-md transition-colors",
                                "aria-selected:bg-green-600 aria-selected:text-black"
                            ),
                            day_selected: "bg-green-600 text-black hover:bg-green-700 hover:text-black focus:bg-green-600",
                            day_today: "border border-green-500/50",
                            day_outside: "text-green-500/30 opacity-50",
                            day_disabled: "text-green-500/20",
                            day_hidden: "invisible",
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
