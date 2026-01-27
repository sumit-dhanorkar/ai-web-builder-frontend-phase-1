'use client'

/**
 * Global Page Loader Component
 * Standard approach - simple full-screen overlay
 * Navbar (z-[9998]) and Sidebar (z-40) naturally appear on top due to z-index
 * No hardcoded positions - works on all screen sizes
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLoading } from '@/lib/loading-context'
import { Sparkles } from 'lucide-react'

export function GlobalLoader() {
  const { isLoading } = useLoading()

  return (
    <AnimatePresence>
      {isLoading && (
        // Simple full-screen overlay
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-md flex items-center justify-center pointer-events-auto"
        >
          {/* Loading icon - centered */}
          <div className="flex flex-col items-center gap-6">
            {/* Spinning icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>

            {/* Animated dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-slate-500"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}