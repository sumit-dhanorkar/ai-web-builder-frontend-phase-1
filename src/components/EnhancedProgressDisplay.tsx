'use client'

/**
 * Enhanced Progress Display Component
 * Unified progress indicator for both manual form and chat pages
 */

import { motion } from 'framer-motion'
import { Check, Building2, Package, Settings, Sparkles } from 'lucide-react'

interface Step {
  id: string
  title: string
  description: string
  icon: any
}

interface EnhancedProgressDisplayProps {
  currentStep: number
  steps: Step[]
  onStepClick?: (index: number) => void
  isCollapsed: boolean
}

export function EnhancedProgressDisplay({
  currentStep,
  steps,
  onStepClick,
  isCollapsed
}: EnhancedProgressDisplayProps) {
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100)

  return (
    <div className={`space-y-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
      {/* Enhanced Progress Circle */}
      {isCollapsed ? (
        <motion.div
          className="relative w-16 h-16 mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Background Circle */}
          <svg className="transform -rotate-90 w-16 h-16">
            <defs>
              <linearGradient id="progress-gradient-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="50%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="url(#progress-gradient-bg)"
              strokeWidth="4"
              fill="none"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              stroke="url(#progress-gradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 28 * (1 - progressPercent / 100)
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              filter="url(#glow)"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <div className="text-base font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                {progressPercent}%
              </div>
            </motion.div>
          </div>

          {/* Pulse Effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-teal-400/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          className="relative bg-gradient-to-br from-white via-teal-50/30 to-slate-50/30 rounded-2xl p-4 border border-teal-100 shadow-lg"
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          {/* Large Progress Circle */}
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg className="transform -rotate-90 w-28 h-28">
              <defs>
                <linearGradient id="progress-gradient-expanded" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="50%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#0f766e" />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#14b8a6" floodOpacity="0.3"/>
                </filter>
              </defs>
              <circle
                cx="56"
                cy="56"
                r="50"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="56"
                cy="56"
                r="50"
                stroke="url(#progress-gradient-expanded)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 50 * (1 - progressPercent / 100)
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                filter="url(#shadow)"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 bg-clip-text text-transparent">
                  {progressPercent}%
                </div>
                <div className="text-xs text-gray-500 font-medium mt-1">Complete</div>
              </motion.div>
            </div>

            {/* Rotating Shimmer */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(20, 184, 166, 0.1) 50%, transparent 100%)'
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Step Info */}
          <div className="text-center space-y-1">
            <div className="text-sm font-bold text-gray-800">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-xs text-teal-600 font-medium">
              {steps[currentStep]?.title}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 w-6'
                      : 'bg-gray-200 w-4'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: index <= currentStep ? 24 : 16 }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Step Navigation */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const StepIcon = step.icon

          return (
            <motion.div
              key={step.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index + 0.3 }}
              onClick={() => onStepClick?.(index)}
              className="relative cursor-pointer group"
            >
              {isCollapsed ? (
                <motion.div
                  className={`relative w-14 h-14 rounded-xl transition-all duration-300 flex items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 text-white shadow-xl shadow-teal-500/50'
                      : isCompleted
                      ? 'bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-300 shadow-md hover:shadow-lg'
                      : 'bg-white/70 border-2 border-gray-200 hover:border-gray-300 hover:bg-white'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={step.title}
                >
                  <motion.div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? 'bg-white/20 backdrop-blur-sm'
                        : isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-teal-600'
                        : 'bg-gray-100'
                    }`}
                    animate={isActive ? {
                      scale: [1, 1.15, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    ) : (
                      <StepIcon className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`} />
                    )}
                  </motion.div>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-400 to-teal-600 rounded-full"
                      initial={{ height: 0 }}
                      animate={{ height: 32 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute left-1/2 top-full w-0.5 h-2 -translate-x-1/2 ${
                      isCompleted ? 'bg-gradient-to-b from-green-400 to-teal-300' : 'bg-gray-200'
                    }`} />
                  )}
                </motion.div>
              ) : (
                <div
                  className={`relative p-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 text-white shadow-xl shadow-teal-500/30'
                      : isCompleted
                      ? 'bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 hover:from-green-100 hover:to-teal-100'
                      : 'bg-white/70 border-2 border-gray-200 hover:border-teal-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Icon */}
                    <motion.div
                      className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-white/20 backdrop-blur-sm shadow-lg'
                          : isCompleted
                          ? 'bg-gradient-to-br from-green-500 to-teal-600 shadow-md'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}
                      animate={isActive ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      ) : (
                        <StepIcon className={`w-6 h-6 ${
                          isActive ? 'text-white' : 'text-gray-600'
                        }`} />
                      )}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-bold text-sm truncate ${
                          isActive ? 'text-white' : isCompleted ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {step.title}
                        </h4>
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                      <p className={`text-xs leading-tight ${
                        isActive ? 'text-teal-100' : 'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/50 to-white/20 rounded-l-xl"
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute left-8 top-full w-0.5 h-2 ${
                      isCompleted ? 'bg-gradient-to-b from-green-400 to-teal-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}