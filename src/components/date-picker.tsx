"use client";

import { ChevronDownIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useAppContext } from "@/contexts/filter.context";

export function DatePicker() {
  const [open, setOpen] = useState(false);
  const { date: dateContext, setDate: setDateContext } = useAppContext();
  const [date, setDate] = useState<Date | undefined>(
    dateContext ? new Date(dateContext) : undefined
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
                    console.log("here!");
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
                    className="h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600"
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
              setDateContext(date ? date.toLocaleDateString() : undefined);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
