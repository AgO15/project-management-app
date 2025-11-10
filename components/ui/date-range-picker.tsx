import * as React from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

// Importa tus componentes de UI
import { cn } from "@/lib/utils" 
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DateRangePicker({ className, date, setDate }: DateRangePickerProps) {
  return (
    // 🚨 CAMBIO 1: El div principal usa 'className' para aplicar el ancho responsive (w-full sm:w-[240px])
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              // 🚨 CAMBIO 2: Eliminamos 'w-[240px]' de aquí. El ancho se controla ahora desde el prop 'className'.
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Selecciona un rango</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}