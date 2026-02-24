"use client";

import { CalendarIcon, ChevronDownIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useAppContext } from "@/contexts/filter.context";
import { useEffect } from "react";

function formatLocalDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export function DatePicker() {
  const [open, setOpen] = useState(false);
  const { date: dateContext, setDate: setDateContext } = useAppContext();
  const [date, setDate] = useState<Date | undefined>(
    dateContext ? parseLocalDate(dateContext) : undefined
  );

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date" className="w-48 justify-between font-normal">
            {date ? date.toLocaleDateString() : "Select date"}
            <div className="flex items-center gap-1">
              {date ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // prevent popover toggle
                    setDate(undefined);
                    setDateContext(undefined);
                  }}
                  id="date"
                  className="w-fit bg-transparent p-0! hover:bg-transparent"
                >
                  <XIcon
                    id="date"
                    color="white"
                    className="text-muted-foreground hover:text-foreground h-4 w-4 cursor-pointer"
                  />
                </div>
              ) : null}
              <ChevronDownIcon />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
              setDateContext(date ? formatLocalDate(date) : undefined);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function SidebarDatePicker({ collapsed }: { collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const { date: dateContext, setDate: setDateContext } = useAppContext();
  const [date, setDate] = useState<Date | undefined>(
    dateContext ? parseLocalDate(dateContext) : undefined
  );

  useEffect(() => {
    if (!dateContext) {
      const today = new Date();
      setDate(today);
      setDateContext(formatLocalDate(today));
    }
  }, [dateContext, setDateContext]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={collapsed ? "ghost" : "outline"}
          id="sidebar-date"
          className={collapsed ? "justify-start p-0! pl-1.5!" : "h-9 w-full justify-between"}
        >
          {collapsed ? (
            <CalendarIcon className="h-2 w-2" />
          ) : (
            <>
              {date ? date.toLocaleDateString("ru-RU") : "Выберите дату"}
              <ChevronDownIcon />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(next) => {
            setDate(next);
            setOpen(false);
            setDateContext(next ? formatLocalDate(next) : undefined);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
