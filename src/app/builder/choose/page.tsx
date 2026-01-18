'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { MessageSquare, FileText, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ChooseBuilderMethodPage() {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<'chat' | 'form' | null>(null)

  const handleChatMode = () => {
    router.push('/builder/chat')
  }

  const handleFormMode = () => {
    router.push('/builder')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Choose Your Creation Method
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select how you'd like to create your website. Both methods collect the same information—choose what works best for you.
        </p>
      </motion.div>

      {/* Choice Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Chat with AI Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onMouseEnter={() => setHoveredCard('chat')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card className={`
            relative overflow-hidden transition-all duration-300 h-full
            ${hoveredCard === 'chat' ? 'shadow-2xl scale-105 border-teal-400' : 'shadow-lg border-gray-200'}
          `}>
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-purple-50 opacity-50" />

            {/* Recommended Badge */}
            <div className="absolute top-4 right-4 z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <span className="px-3 py-1 bg-gradient-to-r from-teal-500 to-purple-500 text-white text-xs font-semibold rounded-full shadow-lg">
                  Recommended
                </span>
              </motion.div>
            </div>

            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-teal-500 to-purple-500 rounded-2xl shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Chat with AI
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Conversational & Easy
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-6">
              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                Have a natural conversation with our AI assistant. Just answer questions as they come—no forms, no overwhelming screens. Perfect for first-time users.
              </p>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Guided conversation</span> - AI asks one question at a time
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Natural language</span> - Type responses in your own words
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">AI assistance</span> - Get help writing descriptions
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Switch anytime</span> - Move to form view if needed
                  </p>
                </div>
              </div>

              {/* Best For */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-teal-800 mb-2">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Best for:
                </p>
                <p className="text-sm text-teal-700">
                  First-time users, those who prefer conversation over forms, or anyone who wants a guided experience.
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleChatMode}
                className="w-full h-12 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start with Chat
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Manual Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onMouseEnter={() => setHoveredCard('form')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card className={`
            relative overflow-hidden transition-all duration-300 h-full
            ${hoveredCard === 'form' ? 'shadow-2xl scale-105 border-indigo-400' : 'shadow-lg border-gray-200'}
          `}>
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-50" />

            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Manual Form
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Structured & Detailed
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-6">
              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                Fill out a comprehensive form at your own pace. See all fields at once and have complete control over every detail. Great for experienced users.
              </p>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Complete overview</span> - See all sections and fields
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Full control</span> - Jump between sections freely
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Familiar interface</span> - Traditional form experience
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">AI assistance</span> - Get help with descriptions
                  </p>
                </div>
              </div>

              {/* Best For */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-indigo-800 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Best for:
                </p>
                <p className="text-sm text-indigo-700">
                  Users who prefer forms, those with all information ready, or anyone who wants complete visibility.
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleFormMode}
                variant="outline"
                className="w-full h-12 border-2 border-indigo-500 text-indigo-700 hover:bg-indigo-50 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Continue with Form
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Info Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mt-12 max-w-3xl mx-auto"
      >
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
          <p className="text-sm text-amber-900 font-medium">
            <span className="font-bold">💡 Pro Tip:</span> You can switch between chat and form at any time without losing your progress. All your data is automatically saved!
          </p>
        </div>
      </motion.div>
    </div>
  )
}
