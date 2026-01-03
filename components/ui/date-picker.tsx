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

// Neumorphic styles
const neuInputStyle = {
    backgroundColor: '#E0E5EC',
    boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.7)',
};

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
                        className="h-10 pr-10 rounded-xl border-0 text-[#444444] placeholder:text-[#aaa] text-sm"
                        style={neuInputStyle}
                    />
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            className="absolute right-1 h-8 w-8 p-0 rounded-lg text-[#7C9EBC] hover:text-[#5A7C9A] hover:bg-[#F0F0F3]"
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                </div>

                <PopoverContent
                    className="w-auto p-3 border-0 rounded-2xl"
                    align="end"
                    sideOffset={4}
                    style={{
                        backgroundColor: '#E0E5EC',
                        boxShadow: '12px 12px 24px rgba(163, 177, 198, 0.6), -12px -12px 24px rgba(255, 255, 255, 0.5)'
                    }}
                >
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelectDate}
                        locale={es}
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-medium text-[#444444]",
                            nav: "space-x-1 flex items-center",
                            nav_button: cn(
                                "h-7 w-7 bg-transparent p-0 rounded-lg",
                                "text-[#7C9EBC] hover:text-[#5A7C9A] hover:bg-[#F0F0F3]"
                            ),
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-[#888888] rounded-md w-8 text-[0.75rem] text-center font-medium",
                            row: "flex w-full mt-2",
                            cell: cn(
                                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                                "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                            ),
                            day: cn(
                                "h-8 w-8 p-0 text-sm font-normal",
                                "text-[#444444] hover:bg-[#D0D5DC] rounded-lg transition-colors"
                            ),
                            day_selected: cn(
                                "text-white rounded-lg",
                                "hover:text-white focus:text-white"
                            ),
                            day_today: "border-2 border-[#7C9EBC] rounded-lg",
                            day_outside: "text-[#aaa] opacity-50",
                            day_disabled: "text-[#ccc] opacity-30",
                            day_hidden: "invisible",
                        }}
                        modifiersStyles={{
                            selected: {
                                background: 'linear-gradient(145deg, #7C9EBC, #6B8DAB)',
                                boxShadow: '2px 2px 4px rgba(163, 177, 198, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
