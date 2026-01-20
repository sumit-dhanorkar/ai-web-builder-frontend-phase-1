'use client'

/**
 * Skip Button Widget
 * Shows a skip button for optional fields
 */

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface SkipButtonWidgetProps {
  field: string
  config?: {
    label?: string
  }
  onComplete: (value: string) => void
  disabled?: boolean
}

export function SkipButtonWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: SkipButtonWidgetProps) {
  const label = config.label || 'Skip this step'

  const handleSkip = () => {
    if (!disabled) {
      onComplete('skip')
    }
  }

  return (
    <div className="mt-3">
      <Button
        onClick={handleSkip}
        disabled={disabled}
        variant="outline"
        className="w-full h-9 border border-gray-300 hover:border-teal-500 hover:bg-teal-50 text-gray-700 hover:text-teal-700 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {label}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}