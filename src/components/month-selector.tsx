'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';

interface MonthSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function MonthSelector({ selectedDate, onDateChange }: MonthSelectorProps) {
  const handlePreviousMonth = () => {
    onDateChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(selectedDate, 1));
  };

  const handleCurrentMonth = () => {
    onDateChange(startOfMonth(new Date()));
  };

  const isCurrentMonth = format(selectedDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviousMonth}
        className="h-8 w-8 p-0"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 min-w-[160px] justify-center">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">
          {format(selectedDate, 'MMMM yyyy')}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNextMonth}
        className="h-8 w-8 p-0"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>

      {!isCurrentMonth && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCurrentMonth}
          className="text-xs"
        >
          Today
        </Button>
      )}
    </div>
  );
}
