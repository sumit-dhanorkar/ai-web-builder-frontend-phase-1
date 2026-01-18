'use client'

/**
 * Team Member Entry Widget
 * Form for adding team member details in chat
 */

import { useState, useRef } from 'react'
import { Check, Users, Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { uploadImage } from '@/lib/firebase-storage'

interface TeamMemberData {
  name: string
  designation: string
  image?: string
}

interface TeamMemberEntryWidgetProps {
  field: string
  config?: {
    label?: string
    required_fields?: string[]
  }
  onComplete: (teamMember: TeamMemberData) => void
  disabled?: boolean
}

export function TeamMemberEntryWidget({
  field,
  config = {},
  onComplete,
  disabled = false,
}: TeamMemberEntryWidgetProps) {
  const [formData, setFormData] = useState<TeamMemberData>({
    name: '',
    designation: '',
    image: '',
  })

  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const requiredFields = config.required_fields || ['name', 'designation']

  const handleChange = (field: keyof TeamMemberData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('👥 Team member image upload triggered')
    const file = e.target.files?.[0]
    if (!file) {
      console.log('❌ No file selected')
      return
    }

    console.log('📁 File selected:', file.name, file.type, file.size)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      setUploading(true)
      console.log('⬆️ Starting upload...')

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string
        console.log('👁️ Preview generated:', preview?.substring(0, 50) + '...')
        setPreview(preview)
      }
      reader.readAsDataURL(file)

      // Upload to Firebase Storage
      console.log('☁️ Uploading to Firebase (team folder)...')
      const url = await uploadImage(file, 'team')
      console.log('✅ Firebase upload complete. URL:', url)

      handleChange('image', url)
      console.log('💾 Updated formData.image:', url)
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      toast.error(error?.message || 'Failed to upload image')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    handleChange('image', '')
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = () => {
    console.log('📝 Team member submit - Current formData:', formData)

    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field as keyof TeamMemberData]) {
        toast.error(`${field} is required`)
        return
      }
    }

    // Clean up empty optional fields
    const cleanedData: TeamMemberData = {
      name: formData.name,
      designation: formData.designation,
    }
    if (formData.image) cleanedData.image = formData.image

    console.log('✅ Team member submit - Sending data:', cleanedData)
    onComplete(cleanedData)
  }

  const isValid = requiredFields.every((field) => formData[field as keyof TeamMemberData])

  return (
    <div className="mt-3 p-4 bg-white rounded-lg border-2 border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
        <Users className="w-4 h-4 text-teal-600" />
        {config.label || 'Add Team Member'}
      </div>

      {/* Member Name */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1">
          Member Name <span className="text-red-500">*</span>
        </Label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., John Doe"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Designation */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1">
          Designation <span className="text-red-500">*</span>
        </Label>
        <Input
          value={formData.designation}
          onChange={(e) => handleChange('designation', e.target.value)}
          placeholder="e.g., CEO, Manager, Developer"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Image Upload */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-1">
          Team Member Photo <span className="text-gray-400 text-xs">(Optional)</span>
        </Label>

        {/* Keep input always in DOM (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={disabled || uploading}
          className="hidden"
        />

        {!preview && !formData.image ? (
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            variant="outline"
            className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-600">Click to upload photo</span>
                <span className="text-xs text-gray-400">Max 5MB</span>
              </div>
            )}
          </Button>
        ) : (
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview || formData.image}
              alt="Team member preview"
              className="w-full h-48 object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || !isValid}
        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold"
      >
        <Check className="w-4 h-4 mr-2" />
        Add Team Member
      </Button>
    </div>
  )
}