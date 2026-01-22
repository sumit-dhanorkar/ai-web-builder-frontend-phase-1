/**
 * Firebase helpers - saves projects via backend API
 * Uses the form-progress endpoint to persist data to Firestore
 */
import { apiClient } from './api-client'

export interface ProjectData {
  business_info: Record<string, any>
  website_config?: Record<string, any>
  project_name: string
  project_type: string
}

/**
 * Save complete project data to cloud via backend
 * Returns a unique identifier for the saved project
 */
export async function saveCompleteProject(projectData: ProjectData): Promise<string> {
  try {
    // Use the form-progress API to save project data
    const response = await apiClient.post<{
      success: boolean
      message?: string
      current_step?: number
      completion_percentage?: number
    }>('/api/form-progress/save', {
      form_type: 'complete_project',
      current_step: 100,
      saved_data: projectData,
      completion_percentage: 100
    })

    if (response.success) {
      // Generate a simple ID based on timestamp and project name
      const projectId = `${projectData.project_name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`
      return projectId
    }

    throw new Error(response.message || 'Failed to save project')
  } catch (error) {
    console.error('Error saving project:', error)
    throw error
  }
}

/**
 * Load saved project data from cloud
 */
export async function loadSavedProject(formType: string = 'complete_project'): Promise<ProjectData | null> {
  try {
    const response = await apiClient.get<{
      success: boolean
      has_saved_progress: boolean
      progress?: {
        saved_data: ProjectData
        current_step: number
        completion_percentage: number
        last_saved: string
      }
    }>(`/api/form-progress/load?form_type=${formType}`)

    if (response.success && response.has_saved_progress && response.progress) {
      return response.progress.saved_data
    }

    return null
  } catch (error) {
    console.error('Error loading saved project:', error)
    return null
  }
}

/**
 * Clear saved project data
 */
export async function clearSavedProject(formType: string = 'complete_project'): Promise<boolean> {
  try {
    const response = await apiClient.delete<{
      success: boolean
      message?: string
    }>(`/api/form-progress/clear?form_type=${formType}`)

    return response.success
  } catch (error) {
    console.error('Error clearing saved project:', error)
    return false
  }
}
