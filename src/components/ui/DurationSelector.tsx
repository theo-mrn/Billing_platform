'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DurationSelectorProps {
  hours: number
  minutes: number
  onDurationChange: (hours: number, minutes: number) => void
  disabled?: boolean
}

export function DurationSelector({ 
  hours, 
  minutes, 
  onDurationChange,
  disabled = false
}: DurationSelectorProps) {
  return (
    <div className="flex gap-2">
      <Select
        value={hours.toString()}
        onValueChange={(value) => onDurationChange(parseInt(value), minutes)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="0 h" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 13 }, (_, i) => (
            <SelectItem key={i} value={i.toString()}>
              {i} h
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={minutes.toString()}
        onValueChange={(value) => onDurationChange(hours, parseInt(value))}
        disabled={disabled}
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="0 min" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => (
            <SelectItem key={i} value={(i * 5).toString()}>
              {i * 5} min
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 