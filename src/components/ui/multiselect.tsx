"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  clearable?: boolean
}

export function MultiSelect({
  options = [],
  selected = [],
  onSelectionChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search items...",
  className,
  disabled = false,
  clearable = true
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onSelectionChange(selected.filter((s) => s !== item))
  }

  const handleClear = () => {
    onSelectionChange([])
  }

  const selectedItems = selected.map(value => 
    options.find(option => option.value === value)
  ).filter(Boolean) as Option[]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-[50px] h-auto w-full cursor-pointer items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-teal-400 hover:shadow-sm transition-all duration-200",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setOpen(!open)
            }
          }}
        >
          <div className="flex gap-1.5 flex-wrap flex-1 items-center">
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <Badge
                  variant="secondary"
                  key={item.value}
                  className="mr-0.5 mb-0.5 flex items-center gap-1.5 px-2.5 py-1 text-sm bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-200"
                >
                  {item.label}
                  <div
                    className="ml-0.5 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-teal-300/50 p-0.5 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        e.stopPropagation()
                        handleUnselect(item.value)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleUnselect(item.value)
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <X className="h-3.5 w-3.5 text-teal-700 hover:text-teal-900" />
                  </div>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-base">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 ml-2">
            {clearable && selectedItems.length > 0 && (
              <div
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleClear()
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    e.stopPropagation()
                    handleClear()
                  }
                }}
              >
                <X className="h-5 w-5" />
              </div>
            )}
            <ChevronDown className="h-5 w-5 opacity-50" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" sideOffset={4}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-12 text-base" />
          <CommandEmpty className="py-6 text-center text-sm">No items found.</CommandEmpty>
          <CommandList className="max-h-[300px]">
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        onSelectionChange(selected.filter((s) => s !== option.value))
                      } else {
                        onSelectionChange([...selected, option.value])
                      }
                    }}
                    className="py-3 cursor-pointer hover:bg-teal-50"
                  >
                    <Check
                      className={cn(
                        "mr-3 h-5 w-5 text-teal-600",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-sm font-medium">{option.label}</span>
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