"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react@0.487.0";
import { DayPicker } from "react-day-picker@8.10.1";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden",
        caption_dropdowns: "flex gap-2",
        dropdown_month: "text-sm px-3 py-1.5 rounded-md bg-stone-50 border border-stone-200 text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-200",
        dropdown_year: "text-sm px-3 py-1.5 rounded-md bg-stone-50 border border-stone-200 text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-200",
        vhidden: "hidden",
        nav: "flex items-center gap-1",
        nav_button: cn(
          "size-8 bg-transparent p-0 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse mt-2",
        head_row: "flex",
        head_cell: "text-stone-500 rounded-md w-9 font-normal text-xs",
        row: "flex w-full mt-1",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: cn(
          "size-9 p-0 font-normal text-stone-700 hover:bg-stone-100 rounded-md transition-colors",
        ),
        day_selected: "bg-gradient-to-br from-rose-400 to-pink-400 text-white hover:from-rose-500 hover:to-pink-500 font-medium",
        day_today: "bg-stone-100 text-stone-900 font-medium",
        day_outside: "text-stone-300 opacity-50",
        day_disabled: "text-stone-300 opacity-30 cursor-not-allowed",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="size-4" {...props} />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="size-4" {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };