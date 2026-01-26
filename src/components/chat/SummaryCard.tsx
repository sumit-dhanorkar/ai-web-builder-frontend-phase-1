'use client'

/**
 * Summary Card Component
 * Displays collected data with edit functionality
 */

import { motion } from 'framer-motion'
import { Edit2, Check, Building2, Mail, Phone, Package, Globe, Users, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { BusinessInfo } from '@/types/chatbot'

interface SummaryCardProps {
  section: 'business' | 'contact' | 'products' | 'export' | 'team' | 'config'
  data: Partial<BusinessInfo>
  onEdit?: (field: string) => void
  showEditButtons?: boolean
}

export function SummaryCard({
  section,
  data,
  onEdit,
  showEditButtons = true,
}: SummaryCardProps) {
  const getSectionIcon = () => {
    switch (section) {
      case 'business':
        return <Building2 className="w-5 h-5 text-teal-600" />
      case 'contact':
        return <Mail className="w-5 h-5 text-teal-600" />
      case 'products':
        return <Package className="w-5 h-5 text-teal-600" />
      case 'export':
        return <Globe className="w-5 h-5 text-teal-600" />
      case 'team':
        return <Users className="w-5 h-5 text-teal-600" />
      case 'config':
        return <Palette className="w-5 h-5 text-teal-600" />
    }
  }

  const getSectionTitle = () => {
    switch (section) {
      case 'business':
        return 'Business Information'
      case 'contact':
        return 'Contact Details'
      case 'products':
        return 'Products & Categories'
      case 'export':
        return 'Export & Certifications'
      case 'team':
        return 'Team Members'
      case 'config':
        return 'Website Configuration'
    }
  }

  const renderBusinessSection = () => (
    <div className="space-y-3">
      <DataRow
        label="Company Name"
        value={data.company_name}
        onEdit={() => onEdit?.('company_name')}
        showEdit={showEditButtons}
      />
      <DataRow
        label="Company Type"
        value={data.company_type}
        onEdit={() => onEdit?.('company_type')}
        showEdit={showEditButtons}
      />
      <DataRow
        label="Description"
        value={data.description}
        onEdit={() => onEdit?.('description')}
        showEdit={showEditButtons}
        multiline
      />
      {data.logo_url && (
        <DataRow
          label="Logo"
          value={<img src={data.logo_url} alt="Logo" className="h-12 w-auto rounded border border-gray-200" />}
          onEdit={() => onEdit?.('logo_url')}
          showEdit={showEditButtons}
        />
      )}
      {data.year_established && (
        <DataRow
          label="Year Established"
          value={data.year_established}
          onEdit={() => onEdit?.('year_established')}
          showEdit={showEditButtons}
        />
      )}
      {data.gst_number && (
        <DataRow
          label="GST Number"
          value={data.gst_number}
          onEdit={() => onEdit?.('gst_number')}
          showEdit={showEditButtons}
        />
      )}
    </div>
  )

  const renderContactSection = () => (
    <div className="space-y-3">
      <DataRow
        label="Email"
        value={data.contact?.email}
        icon={<Mail className="w-4 h-4 text-gray-400" />}
        onEdit={() => onEdit?.('contact.email')}
        showEdit={showEditButtons}
      />
      <DataRow
        label="Phone"
        value={data.contact?.phone}
        icon={<Phone className="w-4 h-4 text-gray-400" />}
        onEdit={() => onEdit?.('contact.phone')}
        showEdit={showEditButtons}
      />
      {data.contact?.whatsapp && (
        <DataRow
          label="WhatsApp"
          value={data.contact.whatsapp}
          onEdit={() => onEdit?.('contact.whatsapp')}
          showEdit={showEditButtons}
        />
      )}
      {data.contact?.address && (
        <DataRow
          label="Address"
          value={data.contact.address}
          onEdit={() => onEdit?.('contact.address')}
          showEdit={showEditButtons}
          multiline
        />
      )}
      {(data.contact?.social_media?.linkedin ||
        data.contact?.social_media?.facebook ||
        data.contact?.social_media?.instagram) && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Social Media</p>
          <div className="space-y-2">
            {data.contact?.social_media?.linkedin && (
              <DataRow
                label="LinkedIn"
                value={data.contact.social_media.linkedin}
                onEdit={() => onEdit?.('contact.social_media.linkedin')}
                showEdit={showEditButtons}
                compact
              />
            )}
            {data.contact?.social_media?.facebook && (
              <DataRow
                label="Facebook"
                value={data.contact.social_media.facebook}
                onEdit={() => onEdit?.('contact.social_media.facebook')}
                showEdit={showEditButtons}
                compact
              />
            )}
            {data.contact?.social_media?.instagram && (
              <DataRow
                label="Instagram"
                value={data.contact.social_media.instagram}
                onEdit={() => onEdit?.('contact.social_media.instagram')}
                showEdit={showEditButtons}
                compact
              />
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderProductsSection = () => (
    <div className="space-y-3">
      {data.categories && data.categories.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Categories ({data.categories.length})
          </p>
          <div className="space-y-2">
            {data.categories.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                    )}
                    {category.products && category.products.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {category.products.map((product, pIdx) => (
                          <Badge key={pIdx} variant="secondary" className="text-xs">
                            {product.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {showEditButtons && (
                    <Button
                      onClick={() => onEdit?.(`categories.${index}`)}
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No categories added yet</p>
      )}
    </div>
  )

  const renderExportSection = () => (
    <div className="space-y-3">
      {data.export_countries && data.export_countries.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Export Countries ({data.export_countries.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {data.export_countries.map((country, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {country.flag_url && (
                  <img
                    src={country.flag_url}
                    alt={country.country_name}
                    className="w-4 h-3 mr-1.5 inline-block object-cover rounded-sm"
                  />
                )}
                {country.country_name}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No export countries added yet</p>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Certifications ({data.certifications.length})
          </p>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index} className="bg-gray-50 rounded p-2 border border-gray-200">
                <p className="font-medium text-xs text-gray-900">{cert.name}</p>
                {cert.authority && (
                  <p className="text-xs text-gray-600">by {cert.authority}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderTeamSection = () => (
    <div className="space-y-3">
      {data.team_members && data.team_members.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Team Members ({data.team_members.length})
          </p>
          <div className="grid grid-cols-2 gap-2">
            {data.team_members.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded p-2 border border-gray-200 flex items-center gap-2">
                {member.image && (
                  <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs text-gray-900 truncate">{member.name}</p>
                  {member.designation && (
                    <p className="text-xs text-gray-600 truncate">{member.designation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No team members added yet</p>
      )}
    </div>
  )

  const renderContent = () => {
    switch (section) {
      case 'business':
        return renderBusinessSection()
      case 'contact':
        return renderContactSection()
      case 'products':
        return renderProductsSection()
      case 'export':
        return renderExportSection()
      case 'team':
        return renderTeamSection()
      default:
        return <p className="text-sm text-gray-500">No data available</p>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border-2 border-teal-200 shadow-md p-4 my-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        {getSectionIcon()}
        <h3 className="text-sm font-semibold text-gray-900">{getSectionTitle()}</h3>
        <Check className="w-4 h-4 text-green-500 ml-auto" />
      </div>

      {/* Content */}
      {renderContent()}
    </motion.div>
  )
}

// Helper component for data rows
interface DataRowProps {
  label: string
  value?: string | React.ReactNode
  icon?: React.ReactNode
  onEdit?: () => void
  showEdit?: boolean
  multiline?: boolean
  compact?: boolean
}

function DataRow({ label, value, icon, onEdit, showEdit, multiline, compact }: DataRowProps) {
  if (!value) return null

  return (
    <div className={`flex items-start justify-between gap-2 ${compact ? 'py-1' : 'py-2'} border-b border-gray-100 last:border-0`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className={`${compact ? 'text-xs' : 'text-xs'} font-medium text-gray-500`}>
            {label}
          </span>
        </div>
        <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-900 ${multiline ? '' : 'truncate'}`}>
          {typeof value === 'string' ? (
            multiline ? (
              <p className="whitespace-pre-wrap">{value}</p>
            ) : (
              <p className="truncate">{value}</p>
            )
          ) : (
            value
          )}
        </div>
      </div>
      {showEdit && onEdit && (
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <Edit2 className="w-3 h-3 text-gray-400 hover:text-teal-600" />
        </Button>
      )}
    </div>
  )
}