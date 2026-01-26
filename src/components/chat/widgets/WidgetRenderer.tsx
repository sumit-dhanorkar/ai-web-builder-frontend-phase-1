'use client'

/**
 * Widget Renderer
 * Dynamically renders widgets based on type
 */

import type { Widget } from '@/types/chatbot'
import { ImageUploadWidget } from './ImageUploadWidget'
import { MultiSelectWidget } from './MultiSelectWidget'
import { SelectWidget } from './SelectWidget'
import { ProductEntryWidget } from './ProductEntryWidget'
import { CertificateSelectWidget } from './CertificateSelectWidget'
import { TeamMemberEntryWidget } from './TeamMemberEntryWidget'
import { ThemeSelectWidget } from './ThemeSelectWidget'
import { ColorSchemeSelectWidget } from './ColorSchemeSelectWidget'
import { DesignConfigWidget } from './DesignConfigWidget'
import { GeneralSettingsWidget } from './GeneralSettingsWidget'
import { AIDescriptionWidget } from './AIDescriptionWidget'
import { SummaryReviewWidget } from './SummaryReviewWidget'
import { SkipButtonWidget } from './SkipButtonWidget'

interface WidgetRendererProps {
  widget: Widget
  onComplete: (value: any) => void
  disabled?: boolean
}

export function WidgetRenderer({ widget, onComplete, disabled = false }: WidgetRendererProps) {
  switch (widget.type) {
    case 'image_upload':
      return (
        <ImageUploadWidget
          field={widget.field}
          config={widget.config}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'multi_select':
      return (
        <MultiSelectWidget
          field={widget.field}
          config={widget.config}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'select':
      return (
        <SelectWidget
          field={widget.field}
          config={widget.config}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'theme_select':
      return (
        <ThemeSelectWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'color_scheme_select':
      return (
        <ColorSchemeSelectWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'design_config':
      return (
        <DesignConfigWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'general_settings':
      return (
        <GeneralSettingsWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'product_entry':
      return (
        <ProductEntryWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'certification_entry':
    case 'certificate_select':
      return (
        <CertificateSelectWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'team_member_entry':
      return (
        <TeamMemberEntryWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'ai_description':
      return (
        <AIDescriptionWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'summary_review':
      return (
        <SummaryReviewWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'skip_button':
      return (
        <SkipButtonWidget
          field={widget.field}
          config={widget.config as any}
          onComplete={onComplete}
          disabled={disabled}
        />
      )

    case 'text_input':
      // Simple text input widget (can be expanded later)
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            Text input widget - {widget.field}
          </p>
        </div>
      )

    default:
      // Unknown widget type
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            Unknown widget type: {widget.type}
          </p>
        </div>
      )
  }
}