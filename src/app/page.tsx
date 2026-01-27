'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Zap,
  Globe,
  Palette,
  Code,
  Rocket,
  ArrowRight,
  Check,
  Star,
  Building2,
  TrendingUp,
  Shield,
  Award,
  Users,
  PlayCircle,
  MessageCircle,
  Lightbulb,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLoading } from '@/lib/loading-context'
import { useActiveJobCheck } from '@/lib/use-active-job-check'
import { jobStateManager } from '@/lib/job-state'
import { Navbar } from '@/components/Navbar'

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const { isAuthenticated, user } = useAuth()
  const { checkAndRedirect } = useActiveJobCheck(user?.uid)
  const router = useRouter()
  const { showLoader, hideLoader } = useLoading()

  const handleStartBuilding = async () => {
    console.log('Start Building clicked:', { isAuthenticated, user: user?.uid })
    showLoader('🚀 Loading builder...')

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      hideLoader()
      router.push('/login')
      return
    }

    // INSTANT CHECK: Check localStorage first (synchronous, no delay)
    // Pass user UID to ensure job belongs to THIS user
    const localJob = jobStateManager.getActiveJob(user?.uid)
    if (localJob && localJob.jobId) {
      // Immediately redirect - no waiting for API
      hideLoader()
      router.push(`/jobs/${localJob.jobId}/progress`)
      return
    }

    // Check backend for active job
    const hasActiveJob = await checkAndRedirect()
    hideLoader()
    if (!hasActiveJob) {
      // No active job, proceed to choice screen
      router.push('/builder/choose')
    }
  }

  const features = [
    {
      icon: Globe,
      title: "Export Trade Expertise",
      description: "Built specifically for Indian exporters with HSN codes, IEC compliance, and international trade documentation",
      color: "from-teal-500 to-slate-500"
    },
    {
      icon: Award,
      title: "Certification Showcase",
      description: "Professional display of APEDA, DGFT, ISO, and industry certifications to build buyer confidence",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "Generate compelling product descriptions, company profiles, and technical specifications automatically",
      color: "from-teal-600 to-slate-600"
    },
    {
      icon: MessageCircle,
      title: "Intelligent Chatbot Builder",
      description: "Create AI-powered chatbots that guide buyers through your catalog, answer queries, and qualify leads automatically",
      color: "from-cyan-600 to-teal-600"
    },
    {
      icon: TrendingUp,
      title: "B2B Lead Generation",
      description: "Convert global buyers with professional inquiry forms, catalog downloads, and trade-focused CTAs",
      color: "from-teal-600 to-cyan-600"
    },
    {
      icon: Shield,
      title: "Trust & Compliance",
      description: "Display GST, Udyam, and export licenses prominently to establish credibility with international buyers",
      color: "from-teal-600 to-slate-600"
    },
    {
      icon: Zap,
      title: "Multi-Language Ready",
      description: "Support for English, Hindi, and regional languages to reach domestic and international markets",
      color: "from-rose-600 to-pink-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-slate-50/20 to-gray-50/30" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-teal-400/10 to-slate-400/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-slate-400/10 to-gray-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-teal-600/10 to-slate-600/10 text-teal-700 border-teal-200/50 rounded-full">
                <Building2 className="w-4 h-4 mr-2" />
                Export Business Solutions • AI-Powered
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-black mb-8 leading-[0.9]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-gray-900 via-teal-800 to-slate-800 bg-clip-text text-transparent">
                Build Stunning
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-slate-600 bg-clip-text text-transparent">
                Export Websites
              </span>
              <br />
              <span className="text-gray-800">in Minutes</span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your export business into a stunning professional website with AI.
              <span className="text-teal-600 font-semibold">Generate complete websites</span> with
              HSN codes, certifications, and intelligent chatbots—no coding required.
            </motion.p>
            
            <motion.div 
              className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button
                onClick={handleStartBuilding}
                size="lg"
                className="group bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-lg px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Start Building Now
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="group text-lg px-10 py-6 rounded-2xl border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-300">
                <PlayCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>
            
            {/* Stats Section */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { number: "500+", label: "Exporters", icon: Users },
                { number: "2 Min", label: "Setup Time", icon: Zap },
                { number: "50+", label: "Countries", icon: Globe },
                { number: "24/7", label: "Support", icon: Shield }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                >
                  <div className="mb-2">
                    <stat.icon className="w-6 h-6 mx-auto text-teal-600 mb-2" />
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-teal-500" />
                No coding required
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-teal-500" />
                Export compliance ready
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-teal-500" />
                Production ready
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-teal-500" />
                SEO optimized
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-teal-50/20 to-slate-50/30" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-20 w-64 h-64 bg-gradient-to-r from-slate-400/20 to-gray-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-teal-800 to-slate-800 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-slate-600 rounded-full mx-auto mb-6"></div>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium">
                Everything you need to create professional export business websites with AI
              </p>
            </motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card className="group h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-md hover:bg-white/80 relative overflow-hidden">
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                  
                  {/* Subtle border */}
                  <div className="absolute inset-0 rounded-xl border-2 border-teal-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative pb-4 z-10">
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                      animate={{ 
                        scale: hoveredFeature === index ? 1.1 : 1,
                        rotate: hoveredFeature === index ? 10 : 0,
                        y: hoveredFeature === index ? -5 : 0
                      }}
                      transition={{ duration: 0.3, type: "spring" }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-gray-600 text-base leading-relaxed group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Process Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple 3-step process to create your professional website
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Path",
                description: "Select between our form-based builder or conversational chatbot for entering your business information"
              },
              {
                step: "02",
                title: "Define Your Website",
                description: "Customize sections, design preferences, and chatbot behavior to match your brand and business needs"
              },
              {
                step: "03",
                title: "Generate & Deploy",
                description: "AI creates your complete Next.js website with integrated chatbot, ready for immediate deployment"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card className="group text-center p-8 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-md hover:bg-white/80 relative overflow-hidden">
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

                  {/* Teal border */}
                  <div className="absolute inset-0 rounded-xl border-2 border-teal-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardHeader className="pb-6 relative z-10">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-teal-700 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      animate={{
                        scale: hoveredFeature === index ? 1.1 : 1,
                        rotate: hoveredFeature === index ? 10 : 0,
                        y: hoveredFeature === index ? -5 : 0
                      }}
                      transition={{ duration: 0.3, type: "spring" }}
                    >
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </motion.div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-gray-600 text-base leading-relaxed group-hover:text-gray-700 transition-colors">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Ready to Build Your Website?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of export businesses who have created stunning websites with our AI-powered builder.
            </p>
            
            <Button
              onClick={handleStartBuilding}
              size="lg"
              className="bg-gradient-to-r from-teal-700 to-slate-600 text-white hover:from-teal-800 hover:to-slate-700 text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
