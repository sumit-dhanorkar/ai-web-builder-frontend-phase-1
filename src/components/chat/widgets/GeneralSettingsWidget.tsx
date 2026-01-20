'use client'

/**
 * General Settings Widget
 * Collects SEO, email configuration, language, and currency settings
 */

import { useState } from 'react'
import { Check, Settings, Loader2, Mail, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'

interface GeneralSettingsWidgetProps {
  field: string
  config?: {
    defaultEmail?: string
    label?: string
  }
  onComplete: (value: any) => void
  disabled?: boolean
}

export function GeneralSettingsWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: GeneralSettingsWidgetProps) {
  const [seoEnabled, setSeoEnabled] = useState(true)
  const [smtpUser, setSmtpUser] = useState(config.defaultEmail || '')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [language, setLanguage] = useState('en')
  const [currency, setCurrency] = useState('USD')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)

    const data = {
      seo_enabled: seoEnabled,
      email_config: {
        smtp_user: smtpUser,
        smtp_password: smtpPassword
      },
      language,
      currency
    }

    onComplete(JSON.stringify(data))

    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }

  const isValid = smtpUser && language && currency

  return (
    <div className="mt-3 p-6 bg-white rounded-lg border-2 border-gray-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-base text-gray-700 font-semibold pb-3 border-b border-gray-200">
        <Settings className="w-5 h-5 text-teal-600" />
        General Settings
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* SEO Enabled */}
        <div className="flex items-center justify-between p-4 bg-teal-50/50 rounded-lg border border-teal-200">
          <div className="flex-1">
            <Label className="text-sm font-medium text-gray-900 mb-1 block">
              SEO Optimization
            </Label>
            <p className="text-xs text-gray-600">
              Enable search engine optimization for better visibility
            </p>
          </div>
          <Switch
            checked={seoEnabled}
            onCheckedChange={setSeoEnabled}
            disabled={disabled}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Email Configuration */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Mail className="w-4 h-4 text-teal-600" />
            Email Configuration
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              SMTP Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="contact@yourcompany.com"
              disabled={disabled}
              className="border-2 border-gray-200 focus:border-teal-500 bg-white"
            />
            <p className="text-xs text-gray-500">
              Email address for sending contact form submissions
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              SMTP Password <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Input
              type="password"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
              placeholder="Leave empty for default configuration"
              disabled={disabled}
              className="border-2 border-gray-200 focus:border-teal-500 bg-white"
            />
          </div>
        </div>

        {/* Language & Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              Language <span className="text-red-500">*</span>
            </Label>
            <Select value={language} onValueChange={setLanguage} disabled={disabled}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-teal-500 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Currency <span className="text-red-500">*</span>
            </Label>
            <Select value={currency} onValueChange={setCurrency} disabled={disabled}>
              <SelectTrigger className="border-2 border-gray-200 focus:border-teal-500 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || !isValid || isSubmitting}
        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium text-sm h-10 shadow-md"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving Settings...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Continue to Final Review
          </>
        )}
      </Button>
    </div>
  )
}