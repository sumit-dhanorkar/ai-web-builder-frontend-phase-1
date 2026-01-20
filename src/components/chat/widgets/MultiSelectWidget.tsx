'use client'

/**
 * Multi-Select Widget for Chat
 * Allows users to select multiple items from a list (e.g., export countries, categories)
 */

import { useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multiselect'
import { exportContriesWithFlags } from '@/data/suggestions'

interface MultiSelectOption {
  value: string
  label: string
  flag_url?: string
}

interface MultiSelectWidgetProps {
  field: string
  config?: {
    options?: MultiSelectOption[]
    placeholder?: string
    label?: string
    maxSelections?: number
    initialValues?: MultiSelectOption[]  // Pre-selected values
  }
  onComplete: (values: MultiSelectOption[]) => void
  disabled?: boolean
}

export function MultiSelectWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: MultiSelectWidgetProps) {
  // Initialize with pre-selected values if provided
  const [selectedValues, setSelectedValues] = useState<string[]>(
    config.initialValues?.map(v => v.value || v.label) || []
  )

  // Use frontend data for export countries instead of backend options
  const options = field === 'export_countries'
    ? exportContriesWithFlags.map(c => ({
        value: c.country_name,
        label: c.country_name,
        flag_url: c.image_url  // Map image_url to flag_url
      }))
    : (config.options || [])

  const placeholder = config.placeholder || 'Search...'
  const label = config.label || 'Select Items'

  const handleComplete = () => {
    // Convert selected values back to full option objects
    const selectedOptions = selectedValues.map(value =>
      options.find(opt => opt.value === value)
    ).filter(Boolean) as MultiSelectOption[]

    onComplete(selectedOptions)
  }

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium mb-2">
        <Globe className="w-4 h-4 text-teal-600" />
        {label}
      </div>

      {/* Multi-Select Dropdown */}
      <MultiSelect
        options={options}
        selected={selectedValues}
        onSelectionChange={setSelectedValues}
        placeholder={placeholder}
        searchPlaceholder="Search countries..."
        disabled={disabled}
      />

      {/* Done Button */}
      <Button
        onClick={handleComplete}
        disabled={disabled || selectedValues.length === 0}
        className="w-full h-10 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium text-sm shadow-md"
      >
        <Check className="w-4 h-4 mr-2" />
        Done ({selectedValues.length} selected)
      </Button>
    </div>
  )
}