/**
 * State Synchronization Utility
 * Handles bidirectional sync between chatbot data and form data
 */

import type { BusinessInfo } from '@/types/chatbot'

/**
 * Sync chatbot collected data to form's businessInfo structure
 *
 * @param chatData - Partial data collected from chatbot
 * @returns Complete businessInfo object with defaults
 */
export function syncChatToForm(chatData: Partial<BusinessInfo>): BusinessInfo {
  // Create default businessInfo structure
  const defaultBusinessInfo: BusinessInfo = {
    company_name: '',
    company_type: '',
    description: '',
    logo_url: '',
    year_established: '',
    iec_code: '',
    gst_number: '',
    udyam_adhar: '',
    contact: {
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      social_media: {
        linkedin: '',
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
      },
    },
    categories: [],
    export_countries: [],
    certifications: [],
    team_members: [],
  }

  // Merge chatData into default structure
  const merged: BusinessInfo = {
    ...defaultBusinessInfo,
    ...chatData,
    contact: {
      ...defaultBusinessInfo.contact,
      ...(chatData.contact || {}),
      social_media: {
        ...defaultBusinessInfo.contact.social_media,
        ...(chatData.contact?.social_media || {}),
      },
    },
    categories: chatData.categories || [],
    export_countries: chatData.export_countries || [],
    certifications: chatData.certifications || [],
    team_members: chatData.team_members || [],
  }

  return merged
}

/**
 * Sync form's businessInfo to chatbot state
 *
 * @param formData - Complete businessInfo from form
 * @returns Partial businessInfo for chatbot
 */
export function syncFormToChat(formData: BusinessInfo): Partial<BusinessInfo> {
  // Return as-is since form data is already complete
  return formData
}

/**
 * Merge chatbot data and form data with conflict resolution
 *
 * Strategy: Chat data takes precedence for fields that exist
 *
 * @param chatData - Data from chatbot
 * @param formData - Data from form
 * @returns Merged businessInfo
 */
export function mergeStates(
  chatData: Partial<BusinessInfo>,
  formData: BusinessInfo
): BusinessInfo {
  const merged: BusinessInfo = {
    // Core fields: chat takes precedence if exists, otherwise use form
    company_name: chatData.company_name || formData.company_name,
    company_type: chatData.company_type || formData.company_type,
    description: chatData.description || formData.description,
    logo_url: chatData.logo_url || formData.logo_url,
    year_established: chatData.year_established || formData.year_established,
    iec_code: chatData.iec_code || formData.iec_code,
    gst_number: chatData.gst_number || formData.gst_number,
    udyam_adhar: chatData.udyam_adhar || formData.udyam_adhar,

    // Contact: deep merge
    contact: {
      email: chatData.contact?.email || formData.contact.email,
      phone: chatData.contact?.phone || formData.contact.phone,
      whatsapp: chatData.contact?.whatsapp || formData.contact.whatsapp,
      address: chatData.contact?.address || formData.contact.address,
      social_media: {
        linkedin: chatData.contact?.social_media?.linkedin || formData.contact.social_media.linkedin,
        facebook: chatData.contact?.social_media?.facebook || formData.contact.social_media.facebook,
        instagram: chatData.contact?.social_media?.instagram || formData.contact.social_media.instagram,
        twitter: chatData.contact?.social_media?.twitter || formData.contact.social_media.twitter,
        youtube: chatData.contact?.social_media?.youtube || formData.contact.social_media.youtube,
      },
    },

    // Arrays: chat takes precedence if has items, otherwise use form
    categories: (chatData.categories && chatData.categories.length > 0)
      ? chatData.categories
      : formData.categories,

    export_countries: (chatData.export_countries && chatData.export_countries.length > 0)
      ? chatData.export_countries
      : formData.export_countries,

    certifications: (chatData.certifications && chatData.certifications.length > 0)
      ? chatData.certifications
      : formData.certifications,

    team_members: (chatData.team_members && chatData.team_members.length > 0)
      ? chatData.team_members
      : formData.team_members,
  }

  return merged
}

/**
 * Load chatbot data from localStorage
 *
 * @returns Partial businessInfo or null
 */
export function loadChatDataFromStorage(): Partial<BusinessInfo> | null {
  if (typeof window === 'undefined') return null

  try {
    const data = localStorage.getItem('chatbot_data')
    if (data) {
      return JSON.parse(data) as Partial<BusinessInfo>
    }
  } catch (error) {
    console.error('Failed to load chatbot data from localStorage:', error)
  }

  return null
}

/**
 * Save chatbot data to localStorage
 *
 * @param data - Data to save
 */
export function saveChatDataToStorage(data: Partial<BusinessInfo>): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('chatbot_data', JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save chatbot data to localStorage:', error)
  }
}

/**
 * Clear chatbot data from localStorage
 */
export function clearChatDataFromStorage(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem('chatbot_data')
  } catch (error) {
    console.error('Failed to clear chatbot data from localStorage:', error)
  }
}

/**
 * Check if there's any chat data in storage
 *
 * @returns true if chat data exists
 */
export function hasChatDataInStorage(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const data = localStorage.getItem('chatbot_data')
    return data !== null && data !== 'null' && data !== '{}'
  } catch (error) {
    return false
  }
}

/**
 * Calculate how much data has been collected
 *
 * @param data - BusinessInfo data
 * @returns Percentage of completion (0-100)
 */
export function calculateDataCompleteness(data: Partial<BusinessInfo>): number {
  let filled = 0
  let total = 0

  // Required fields (weight: 2 points each)
  const requiredFields = [
    data.company_name,
    data.company_type,
    data.description,
    data.contact?.email,
    data.contact?.phone,
  ]

  requiredFields.forEach(field => {
    total += 2
    if (field && field.trim()) filled += 2
  })

  // Optional fields (weight: 1 point each)
  const optionalFields = [
    data.logo_url,
    data.year_established,
    data.iec_code,
    data.gst_number,
    data.contact?.whatsapp,
    data.contact?.address,
  ]

  optionalFields.forEach(field => {
    total += 1
    if (field && field.trim()) filled += 1
  })

  // Arrays (weight: 3 points each if has items)
  const arrayFields = [
    data.categories,
    data.export_countries,
    data.certifications,
    data.team_members,
  ]

  arrayFields.forEach(arr => {
    total += 3
    if (arr && arr.length > 0) filled += 3
  })

  return Math.round((filled / total) * 100)
}