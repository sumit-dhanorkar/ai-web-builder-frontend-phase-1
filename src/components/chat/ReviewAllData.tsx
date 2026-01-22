'use client'

/**
 * Review All Data Component
 * Final comprehensive review before website generation
 */

import { motion } from 'framer-motion'
import { Check, AlertCircle, ArrowRight, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SummaryCard } from './SummaryCard'
import type { BusinessInfo } from '@/types/chatbot'

interface ReviewAllDataProps {
  data: Partial<BusinessInfo>
  onEdit: (field: string) => void
  onConfirm: () => void
  isGenerating?: boolean
}

export function ReviewAllData({
  data,
  onEdit,
  onConfirm,
  isGenerating = false,
}: ReviewAllDataProps) {
  // Check data completeness
  const hasBusinessInfo = !!(data.company_name && data.company_type && data.description)
  const hasContactInfo = !!(data.contact?.email && data.contact?.phone)
  const hasProducts = !!(data.categories && data.categories.length > 0)
  const hasExportInfo = !!(data.export_countries && data.export_countries.length > 0)

  const completionChecks = [
    { label: 'Business Information', completed: hasBusinessInfo, required: true },
    { label: 'Contact Details', completed: hasContactInfo, required: true },
    { label: 'Products & Categories', completed: hasProducts, required: true },
    { label: 'Export Countries', completed: hasExportInfo, required: false },
    { label: 'Certifications', completed: !!(data.certifications && data.certifications.length > 0), required: false },
    { label: 'Team Members', completed: !!(data.team_members && data.team_members.length > 0), required: false },
  ]

  const allRequiredComplete = completionChecks
    .filter(c => c.required)
    .every(c => c.completed)

  const completedCount = completionChecks.filter(c => c.completed).length
  const totalCount = completionChecks.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 space-y-4"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Review Your Information</h2>
            <p className="text-teal-100 text-sm mt-1">
              Almost there! Let's make sure everything looks good before we create your website.
            </p>
          </div>
        </div>

        {/* Completion Status */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Completion Status</span>
            <span className="text-sm">
              {completedCount}/{totalCount} sections
            </span>
          </div>

          <div className="space-y-2">
            {completionChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {check.completed ? (
                    <Check className="w-4 h-4 text-green-300" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-300" />
                  )}
                  {check.label}
                  {check.required && <span className="text-xs text-teal-200">(Required)</span>}
                </span>
                <span className={check.completed ? 'text-green-300' : 'text-amber-300'}>
                  {check.completed ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Required Field Warning */}
      {!allRequiredComplete && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Required Information Missing</p>
            <p className="text-amber-700 text-xs mt-1">
              Please complete all required sections before generating your website.
            </p>
          </div>
        </motion.div>
      )}

      {/* Data Summaries - Removed as per user request
          User can review each section individually via review widgets */}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onConfirm}
          disabled={!allRequiredComplete || isGenerating}
          className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-6 text-lg shadow-lg"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Generating Website...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5 mr-2" />
              Generate My Website
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {allRequiredComplete && (
        <p className="text-center text-sm text-gray-600">
          Everything looks great! Click the button above to create your professional website.
        </p>
      )}
    </motion.div>
  )
}