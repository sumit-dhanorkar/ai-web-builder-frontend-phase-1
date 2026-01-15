"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Briefcase, Zap, Sparkles, Square, Building, Palette, Monitor, Gem, Settings, Leaf, Clock, Flame, Cloud, Rocket, Shield, Minimize, Bold, Crown, Lightbulb, Triangle, Flower, Rainbow, Circle, Layers, Star, Box } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface IconComboboxOption {
  value: string
  label: string
  icon?: string
}

interface IconComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  options: Array<IconComboboxOption>
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  briefcase: Briefcase,
  zap: Zap,
  sparkles: Sparkles,
  square: Square,
  building: Building,
  palette: Palette,
  monitor: Monitor,
  gem: Gem,
  cog: Settings,
  leaf: Leaf,
  clock: Clock,
  flame: Flame,
  cloud: Cloud,
  rocket: Rocket,
  shield: Shield,
  minimize: Minimize,
  bold: Bold,
  crown: Crown,
  lightbulb: Lightbulb,
  triangle: Triangle,
  flower: Flower,
  rainbow: Rainbow,
  circle: Circle,
  layers: Layers,
  star: Star,
  box: Box,
  texture: Square, // fallback for texture
  glass: Circle, // fallback for glass
  'circle-dot': Circle, // fallback for circle-dot
}

export function IconCombobox({
  value,
  onValueChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
}: IconComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)
  const SelectedIcon = selectedOption?.icon ? iconMap[selectedOption.icon] : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {SelectedIcon && (
              <SelectedIcon className="h-4 w-4 z-10" style={{ color: '#14B8A6' }} />
            )}
            <span className="truncate">
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" side="bottom" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => {
                const OptionIcon = option.icon ? iconMap[option.icon] : null
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      const newValue = currentValue === value ? "" : currentValue
                      onValueChange?.(newValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {OptionIcon && (
                      <OptionIcon className="mr-2 h-4 w-4 z-10" style={{ color: '#14B8A6' }} />
                    )}
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}