'use client'

/**
 * Global Loading Context
 * Standard simple loader - covers entire screen during API calls
 * Navbar and Sidebar naturally appear on top due to z-index stacking
 */

import React, { createContext, useContext, useState, useCallback } from 'react'

interface LoadingContextValue {
  isLoading: boolean
  loadingMessage: string
  showLoader: (message?: string) => void
  hideLoader: () => void
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined)

interface LoadingProviderProps {
  children: React.ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')

  const showLoader = useCallback((message: string = 'Loading...') => {
    setIsLoading(true)
    setLoadingMessage(message)
  }, [])

  const hideLoader = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('Loading...')
  }, [])

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        showLoader,
        hideLoader,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}