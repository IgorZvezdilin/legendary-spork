"use client";

import { CalendarIcon, ChevronDownIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useAppContext } from "@/contexts/filter.context";
import { useEffect } from "react";
import type { DateRange } from "react-day-picker";

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function getWeekStart(value: Date) {
  const day = value.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const result = new Date(value);
  result.setDate(value.getDate() + mondayOffset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekEnd(start: Date) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(0, 0, 0, 0);
  return end;
}


function formatDisplayRange(range?: DateRange) {
  if (!range?.from) return "Выберите диапазон";
  const from = range.from.toLocaleDateString("ru-RU");
  const to = range.to ? range.to.toLocaleDateString("ru-RU") : "";
  if (!to || from === to) return from;
  return `${from} — ${to}`;
}

function toLocalDateString(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateRange(range?: { from?: string; to?: string }): DateRange | undefined {
  if (!range?.from) return undefined;
  return {
    from: parseLocalDate(range.from),
    to: range.to ? parseLocalDate(range.to) : undefined,
  };
}

function fromDateRange(range?: DateRange): { from?: string; to?: string } | undefined {
  if (!range?.from) return undefined;
  return {
    from: toLocalDateString(range.from),
    to: range.to ? toLocalDateString(range.to) : undefined,
  };
}

export function DatePicker() {
  const [open, setOpen] = useState(false);
  const { dateRange, setDateRange } = useAppContext();
  const [range, setRange] = useState<DateRange | undefined>(toDateRange(dateRange));
  const [awaitingEnd, setAwaitingEnd] = useState(false);

  useEffect(() => {
    if (!dateRange?.from) {
      const today = new Date();
      const weekStart = getWeekStart(today);
      const weekEnd = getWeekEnd(weekStart);
      const nextRange = { from: toLocalDateString(weekStart), to: toLocalDateString(weekEnd) };
      setRange({ from: weekStart, to: weekEnd });
      setDateRange(nextRange);
      return;
    }
    setRange(toDateRange(dateRange));
  }, [dateRange]);

  return (
    <div className="flex flex-col gap-3">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) {
            setRange(undefined);
            setAwaitingEnd(true);
          } else {
            setAwaitingEnd(false);
          }
        }}
      >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          size="sm"
          className="relative h-9 w-56 justify-start text-sm font-normal"
        >
          <span className="block w-full truncate pr-10 text-left">
            {formatDisplayRange(range)}
          </span>
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <ChevronDownIcon />
          </div>
        </Button>
      </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            captionLayout="dropdown"
            onSelect={(next) => {
              if (awaitingEnd && next?.from && next?.to) {
                const sameDay = next.from.getTime() === next.to.getTime();
                if (sameDay) {
                  const partial = { from: next.from, to: undefined };
                  setRange(partial);
                  setDateRange(fromDateRange(partial));
                  return;
                }
              }
              setRange(next);
              setDateRange(fromDateRange(next));
              if (next?.from && next?.to) {
                setOpen(false);
                setAwaitingEnd(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function SidebarDatePicker({ collapsed }: { collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const { dateRange, setDateRange } = useAppContext();
  const [range, setRange] = useState<DateRange | undefined>(toDateRange(dateRange));
  const [awaitingEnd, setAwaitingEnd] = useState(false);

  useEffect(() => {
    if (!dateRange?.from) {
      const today = new Date();
      const weekStart = getWeekStart(today);
      const weekEnd = getWeekEnd(weekStart);
      const nextRange = { from: toLocalDateString(weekStart), to: toLocalDateString(weekEnd) };
      setRange({ from: weekStart, to: weekEnd });
      setDateRange(nextRange);
    }
  }, [dateRange, setDateRange]);

  useEffect(() => {
    if (dateRange?.from) {
      setRange(toDateRange(dateRange));
    }
  }, [dateRange]);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setRange(undefined);
          setAwaitingEnd(true);
        } else {
          setAwaitingEnd(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant={collapsed ? "ghost" : "outline"}
          id="sidebar-date"
          className={
            collapsed ? "justify-start p-0! pl-1.5!" : "relative h-9 w-full justify-start"
          }
        >
          {collapsed ? (
            <CalendarIcon className="h-2 w-2" />
          ) : (
            <>
              <span className="block w-full truncate pr-8 text-left">
                {formatDisplayRange(range)}
              </span>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          captionLayout="dropdown"
          onSelect={(next) => {
            if (awaitingEnd && next?.from && next?.to) {
              const sameDay = next.from.getTime() === next.to.getTime();
              if (sameDay) {
                const partial = { from: next.from, to: undefined };
                setRange(partial);
                setDateRange(fromDateRange(partial));
                return;
              }
            }
            setRange(next);
            setDateRange(fromDateRange(next));
            if (next?.from && next?.to) {
              setOpen(false);
              setAwaitingEnd(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
