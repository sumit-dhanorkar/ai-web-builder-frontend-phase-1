'use client'

/**
 * Progress Indicator Component
 * Shows visual progress through conversation sections
 */

import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface Section {
  id: string
  label: string
  description: string
}

interface ProgressIndicatorProps {
  currentSection: string
  completionPercent: number
  fieldsCollected: number
  totalFields: number
}

const SECTIONS: Section[] = [
  { id: 'welcome', label: 'Welcome', description: 'Getting started' },
  { id: 'business_info', label: 'Business', description: 'Company details' },
  { id: 'contact', label: 'Contact', description: 'Contact information' },
  { id: 'products', label: 'Products', description: 'Products & categories' },
  { id: 'export_cert', label: 'Export', description: 'Countries & certifications' },
  { id: 'team', label: 'Team', description: 'Team members' },
  { id: 'config', label: 'Config', description: 'Website preferences' },
  { id: 'review', label: 'Review', description: 'Final review' },
]

export function ProgressIndicator({
  currentSection,
  completionPercent,
  fieldsCollected,
  totalFields,
}: ProgressIndicatorProps) {
  const currentIndex = SECTIONS.findIndex(s => s.id === currentSection)

  const getSectionStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (index < currentIndex) return 'completed'
    if (index === currentIndex) return 'current'
    return 'upcoming'
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Overall Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-teal-600">
              {completionPercent}%
            </span>
          </div>
          <Progress
            value={completionPercent}
            className="h-2.5 bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            {fieldsCollected} of {totalFields} fields completed
          </p>
        </div>

        {/* Section Steps */}
        <div className="relative">
          {/* Desktop View - Horizontal */}
          <div className="hidden md:flex items-center justify-between">
            {SECTIONS.map((section, index) => {
              const status = getSectionStatus(index)
              const isLast = index === SECTIONS.length - 1

              return (
                <div key={section.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                          ${status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : status === 'current'
                            ? 'bg-teal-600 border-teal-600 ring-4 ring-teal-100'
                            : 'bg-white border-gray-300'
                          }
                        `}
                      >
                        {status === 'completed' ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : status === 'current' ? (
                          <Circle className="w-5 h-5 text-white fill-white" />
                        ) : (
                          <span className="text-xs text-gray-400 font-semibold">
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </motion.div>

                    {/* Label */}
                    <div className="mt-2 text-center">
                      <p
                        className={`
                          text-xs font-semibold whitespace-nowrap
                          ${status === 'current'
                            ? 'text-teal-700'
                            : status === 'completed'
                            ? 'text-green-600'
                            : 'text-gray-400'
                          }
                        `}
                      >
                        {section.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="flex-1 h-0.5 mx-2 relative top-[-20px]">
                      <div
                        className={`
                          h-full transition-all duration-500
                          ${status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile View - Compact */}
          <div className="md:hidden">
            <div className="flex items-center gap-3">
              {SECTIONS.map((section, index) => {
                const status = getSectionStatus(index)

                return (
                  <div
                    key={section.id}
                    className={`
                      flex-1 h-2 rounded-full transition-all duration-300
                      ${status === 'completed'
                        ? 'bg-green-500'
                        : status === 'current'
                        ? 'bg-teal-600'
                        : 'bg-gray-200'
                      }
                    `}
                  />
                )
              })}
            </div>
            <p className="text-sm text-center mt-3 font-medium text-gray-700">
              {SECTIONS[currentIndex]?.label || 'Welcome'} - {SECTIONS[currentIndex]?.description || 'Getting started'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}