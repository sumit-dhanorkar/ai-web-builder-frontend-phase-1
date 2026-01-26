'use client'

/**
 * Certificate Selection Widget
 * Simple dropdown selector for predefined certifications
 */

import { useState } from 'react'
import { Check, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { predefinedCertifications } from '@/data/suggestions'

interface CertificateData {
  name: string
  certificate_url: string
  verification_url: string
  authority: string
}

interface CertificateSelectWidgetProps {
  field: string
  config?: {
    label?: string
    required_fields?: string[]
  }
  onComplete: (certificates: CertificateData[]) => void
  disabled?: boolean
}

export function CertificateSelectWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: CertificateSelectWidgetProps) {
  const [selectedCerts, setSelectedCerts] = useState<CertificateData[]>([])

  const handleToggleCertificate = (cert: any) => {
    setSelectedCerts(prev => {
      const exists = prev.find(c => c.name === cert.name)
      if (exists) {
        return prev.filter(c => c.name !== cert.name)
      } else {
        return [...prev, {
          name: cert.name,
          certificate_url: cert.certificate_url,
          verification_url: cert.verification_url,
          authority: cert.authority
        }]
      }
    })
  }

  const handleSubmit = () => {
    if (selectedCerts.length === 0) {
      toast.error('Please select at least one certification')
      return
    }

    onComplete(selectedCerts)
  }

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
        <Award className="w-4 h-4 text-teal-600" />
        {config.label || 'Select Certifications'}
      </div>

      {/* Certification Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {predefinedCertifications.map(cert => {
          const isSelected = selectedCerts.some(c => c.name === cert.name)
          return (
            <button
              key={cert.name}
              onClick={() => handleToggleCertificate(cert)}
              disabled={disabled}
              className={`relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-105 ${
                isSelected
                  ? 'border-teal-500 bg-teal-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-teal-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Certificate Image */}
              <img
                src={cert.certificate_url}
                alt={cert.name}
                className="w-full h-16 object-contain mb-2"
              />

              {/* Certificate Name */}
              <p className="text-xs font-medium text-gray-700 line-clamp-2">
                {cert.name}
              </p>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-teal-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Count */}
      {selectedCerts.length > 0 && (
        <div className="text-xs text-teal-600 font-medium">
          {selectedCerts.length} certification{selectedCerts.length !== 1 ? 's' : ''} selected
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || selectedCerts.length === 0}
        className="w-full h-10 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium text-sm shadow-md"
      >
        <Check className="w-4 h-4 mr-2" />
        Confirm {selectedCerts.length > 0 ? `(${selectedCerts.length})` : ''}
      </Button>
    </div>
  )
}