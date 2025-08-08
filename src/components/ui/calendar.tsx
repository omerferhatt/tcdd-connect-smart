import React, { useState } from "react"
import { ComponentProps } from "react"
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left"
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface CalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  mode?: "single"
}

function Calendar({
  className,
  selected,
  onSelect,
  disabled,
  mode = "single",
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date())
  
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ]
  
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
  
  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  // Get first day of month and adjust for Monday start (0 = Monday, 6 = Sunday)
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
  
  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Generate calendar days
  const calendarDays: (Date | null)[] = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day))
  }
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }
  
  const isSelected = (date: Date) => {
    if (!selected || !date) return false
    return date.toDateString() === selected.toDateString()
  }
  
  const isToday = (date: Date) => {
    if (!date) return false
    return date.toDateString() === today.toDateString()
  }
  
  const isDisabled = (date: Date) => {
    if (!date) return true
    return disabled ? disabled(date) : false
  }
  
  const handleDayClick = (date: Date) => {
    if (isDisabled(date)) return
    onSelect?.(date)
  }
  
  return (
    <div className={cn("p-3", className)}>
      {/* Header with month/year and navigation */}
      <div className="flex justify-center items-center relative w-full mb-4">
        <button
          onClick={goToPreviousMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="text-sm font-medium">
          {monthNames[month]} {year}
        </div>
        
        <button
          onClick={goToNextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Calendar grid */}
      <div className="w-full min-w-[280px]">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-10 w-10 flex items-center justify-center text-muted-foreground text-xs font-normal"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((date, index) => (
            <div key={index} className="h-10 w-10 flex items-center justify-center">
              {date && (
                <button
                  onClick={() => handleDayClick(date)}
                  disabled={isDisabled(date)}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground",
                    isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isToday(date) && !isSelected(date) && "bg-accent text-accent-foreground font-semibold",
                    isDisabled(date) && "text-muted-foreground opacity-50 cursor-not-allowed"
                  )}
                >
                  {date.getDate()}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Calendar }
