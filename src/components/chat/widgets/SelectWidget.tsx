'use client'

/**
 * Select Widget for Chat
 * Allows users to select one item from a list (e.g., company type)
 */

import { useState } from 'react'
import { Check, ChevronRight, Plus, CheckCircle, Users, SkipForward, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Plus,
  CheckCircle,
  Users,
  SkipForward,
}

interface SelectOption {
  value: string
  label: string
  icon?: string
}

interface SelectWidgetProps {
  field: string
  config?: {
    options?: SelectOption[]
    placeholder?: string
    label?: string
  }
  onComplete: (value: string) => void
  disabled?: boolean
}

export function SelectWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: SelectWidgetProps) {
  const [selectedValue, setSelectedValue] = useState<string>('')

  const options = config.options || []
  const label = config.label || 'Select an option'

  const handleSelectItem = (value: string) => {
    setSelectedValue(value)
    // Auto-submit on selection
    onComplete(value)
  }

  return (
    <div className="mt-3 p-3 bg-gradient-to-br from-white to-teal-50/30 rounded-lg border border-teal-200 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
        <ChevronRight className="w-4 h-4 text-teal-600" />
        {label}
      </div>

      {/* Options List - Single row for 2 or fewer options, vertical for more */}
      <div className={`max-h-96 overflow-y-auto ${options.length <= 2 ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}>
        {options.map((option) => {
          const selected = selectedValue === option.value
          const IconComponent = option.icon ? iconMap[option.icon] : null

          return (
            <button
              key={option.value}
              onClick={() => handleSelectItem(option.value)}
              disabled={disabled}
              className={`
                w-full px-3 py-2.5 flex items-center justify-between rounded-lg transition-all duration-200
                ${selected
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
                  : 'bg-white hover:bg-teal-50 border border-gray-200 hover:border-teal-300 hover:shadow-sm'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${options.length <= 2 ? 'flex-col gap-1.5 items-center justify-center' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                {IconComponent && (
                  <IconComponent className={`w-5 h-5 ${selected ? 'text-white' : 'text-teal-600'}`} />
                )}
                <span className={`text-sm font-medium ${options.length <= 2 ? 'text-center' : 'text-left'} ${selected ? 'text-white' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </div>

              {selected && options.length > 2 && (
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {options.length === 0 && (
        <div className="p-6 text-center text-gray-500 text-sm">
          No options available
        </div>
      )}
    </div>
  )
}