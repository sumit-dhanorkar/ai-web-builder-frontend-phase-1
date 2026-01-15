'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ImageUpload } from '@/components/ui/image-upload'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Package, 
  Plus, 
  Trash2, 
  Globe,
  Award,
  FileText,
  Image,
  Sparkles,
  Star,
  Shield,
  Zap,
  CheckCircle,
  Target,
  TrendingUp,
  Edit,
  Save,
  X,
  Building
} from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { MultiSelect } from '@/components/ui/multiselect'
import {
  exportContriesWithFlags,
  commonCertifications as certificationOptions,
  issuingAuthorities as authorityOptions
} from '@/data/suggestions'
import { FaCheckCircle } from 'react-icons/fa'

interface Product {
  name: string
  description: string
  hsn_code: string
  image_url: string
  specifications: {
    grade: string
    origin: string
    color: string
    purity: string
    moisture_content: string
    shelf_life: string
    moq: string
    lead_time: string
  }
  key_benefits: string[]
}

interface Category {
  name: string
  description: string
  products: Product[]
}

interface Certification {
  name: string
  issuing_authority: string
  description: string
  certificate_image_url?: string
  certificate_pdf_url?: string
}

interface ExportCountry {
  country_name: string
  flag_url: string
}

interface ProductStepProps {
  categories: Category[]
  exportCountries: ExportCountry[]
  certifications: Certification[]
  onUpdateCategories: (categories: Category[]) => void
  onUpdateCountries: (countries: ExportCountry[]) => void
  onUpdateCertifications: (certifications: Certification[]) => void
}

export function ProductStep({ 
  categories, 
  exportCountries, 
  certifications,
  onUpdateCategories,
  onUpdateCountries,
  onUpdateCertifications 
}: ProductStepProps) {
  

  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number | null>(null)
  const [currentProductIndex, setCurrentProductIndex] = useState<number | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Certification modal states
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false)
  const [currentCertification, setCurrentCertification] = useState<Certification | null>(null)
  const [currentCertificationIndex, setCurrentCertificationIndex] = useState<number | null>(null)
  const [isCertEditMode, setIsCertEditMode] = useState(false)

  const addCategory = () => {
    const newCategory: Category = {
      name: '',
      description: '',
      products: []
    }
    onUpdateCategories([...categories, newCategory])
  }

  const removeCategory = (index: number) => {
    onUpdateCategories(categories.filter((_, i) => i !== index))
  }

  const updateCategory = (index: number, field: keyof Category, value: string) => {
    const updated = categories.map((cat, i) => 
      i === index ? { ...cat, [field]: value } : cat
    )
    onUpdateCategories(updated)
  }

  const openAddProductModal = (categoryIndex: number) => {
    const newProduct: Product = {
      name: '',
      description: '',
      hsn_code: '',
      image_url: '',
      specifications: {
        grade: '',
        origin: '',
        color: '',
        purity: '',
        moisture_content: '',
        shelf_life: '',
        moq: '',
        lead_time: ''
      },
      key_benefits: ['']
    }
    
    setCurrentProduct(newProduct)
    setCurrentCategoryIndex(categoryIndex)
    setCurrentProductIndex(null)
    setIsEditMode(false)
    setIsProductModalOpen(true)
  }

  const openEditProductModal = (categoryIndex: number, productIndex: number) => {
    const product = categories[categoryIndex].products[productIndex]
    setCurrentProduct({ ...product })
    setCurrentCategoryIndex(categoryIndex)
    setCurrentProductIndex(productIndex)
    setIsEditMode(true)
    setIsProductModalOpen(true)
  }

  const saveProduct = () => {
    if (!currentProduct || currentCategoryIndex === null || !currentProduct.name?.trim()) {
      return;
    }
    
    if (isEditMode && currentProductIndex !== null) {
      // Edit existing product
      const updated = categories.map((cat, i) => 
        i === currentCategoryIndex 
          ? {
              ...cat, 
              products: cat.products.map((prod, j) => 
                j === currentProductIndex ? currentProduct : prod
              )
            }
          : cat
      )
      onUpdateCategories(updated)
    } else {
      // Add new product
      const updated = categories.map((cat, i) => 
        i === currentCategoryIndex 
          ? { ...cat, products: [...cat.products, currentProduct] }
          : cat
      )
      onUpdateCategories(updated)
    }
    
    closeProductModal()
  }

  const closeProductModal = () => {
    setIsProductModalOpen(false)
    setCurrentProduct(null)
    setCurrentCategoryIndex(null)
    setCurrentProductIndex(null)
    setIsEditMode(false)
  }

  const updateCurrentProduct = (field: keyof Product, value: any) => {
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, [field]: value })
    }
  }

  const updateCurrentProductSpec = (field: string, value: string) => {
    if (currentProduct) {
      setCurrentProduct({
        ...currentProduct,
        specifications: {
          ...currentProduct.specifications,
          [field]: value
        }
      })
    }
  }

  const addCurrentProductBenefit = () => {
    if (currentProduct) {
      setCurrentProduct({
        ...currentProduct,
        key_benefits: [...currentProduct.key_benefits, '']
      })
    }
  }

  const updateCurrentProductBenefit = (index: number, value: string) => {
    if (currentProduct) {
      setCurrentProduct({
        ...currentProduct,
        key_benefits: currentProduct.key_benefits.map((benefit, i) => 
          i === index ? value : benefit
        )
      })
    }
  }

  const removeCurrentProductBenefit = (index: number) => {
    if (currentProduct && currentProduct.key_benefits.length > 1) {
      setCurrentProduct({
        ...currentProduct,
        key_benefits: currentProduct.key_benefits.filter((_, i) => i !== index)
      })
    }
  }

  // Certification modal functions
  const openAddCertificationModal = () => {
    const newCertification: Certification = {
      name: '',
      issuing_authority: '',
      description: '',
      certificate_image_url: '',
      certificate_pdf_url: ''
    }
    
    setCurrentCertification(newCertification)
    setCurrentCertificationIndex(null)
    setIsCertEditMode(false)
    setIsCertificationModalOpen(true)
  }

  const openEditCertificationModal = (certificationIndex: number) => {
    const certification = certifications[certificationIndex]
    setCurrentCertification({ ...certification })
    setCurrentCertificationIndex(certificationIndex)
    setIsCertEditMode(true)
    setIsCertificationModalOpen(true)
  }

  const saveCertification = () => {
    if (currentCertification) {
      if (isCertEditMode && currentCertificationIndex !== null) {
        // Edit existing certification
        const updated = certifications.map((cert, i) => 
          i === currentCertificationIndex ? currentCertification : cert
        )
        onUpdateCertifications(updated)
      } else {
        // Add new certification
        onUpdateCertifications([...certifications, currentCertification])
      }
      
      closeCertificationModal()
    }
  }

  const closeCertificationModal = () => {
    setIsCertificationModalOpen(false)
    setCurrentCertification(null)
    setCurrentCertificationIndex(null)
    setIsCertEditMode(false)
  }

  const updateCurrentCertification = (field: keyof Certification, value: string) => {
    if (currentCertification) {
      setCurrentCertification({ ...currentCertification, [field]: value })
    }
  }

  const removeProduct = (categoryIndex: number, productIndex: number) => {
    const updated = categories.map((cat, i) => 
      i === categoryIndex 
        ? { ...cat, products: cat.products.filter((_, j) => j !== productIndex) }
        : cat
    )
    onUpdateCategories(updated)
  }

  const updateProduct = (categoryIndex: number, productIndex: number, field: keyof Product, value: any) => {
    const updated = categories.map((cat, i) => 
      i === categoryIndex 
        ? {
            ...cat, 
            products: cat.products.map((prod, j) => 
              j === productIndex ? { ...prod, [field]: value } : prod
            )
          }
        : cat
    )
    onUpdateCategories(updated)
  }

  const addBenefit = (categoryIndex: number, productIndex: number) => {
    const updated = categories.map((cat, i) => 
      i === categoryIndex 
        ? {
            ...cat, 
            products: cat.products.map((prod, j) => 
              j === productIndex 
                ? { ...prod, key_benefits: [...prod.key_benefits, ''] }
                : prod
            )
          }
        : cat
    )
    onUpdateCategories(updated)
  }

  const updateBenefit = (categoryIndex: number, productIndex: number, benefitIndex: number, value: string) => {
    const updated = categories.map((cat, i) => 
      i === categoryIndex 
        ? {
            ...cat, 
            products: cat.products.map((prod, j) => 
              j === productIndex 
                ? { 
                    ...prod, 
                    key_benefits: prod.key_benefits.map((benefit, k) => 
                      k === benefitIndex ? value : benefit
                    )
                  }
                : prod
            )
          }
        : cat
    )
    onUpdateCategories(updated)
  }


  const addCertification = () => {
    openAddCertificationModal()
  }

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = certifications.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    )
    onUpdateCertifications(updated)
  }

  const removeCertification = (index: number) => {
    onUpdateCertifications(certifications.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8">
      {/* Product Categories */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50/30 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-slate-500 h-2"></div>
        <CardHeader className="bg-gradient-to-r from-teal-50/50 to-slate-50/50 border-b border-gray-100">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Package className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                Product Categories & Services
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-1">
                Define your product categories and showcase your offerings with detailed information
              </CardDescription>
            </div>
            <motion.div 
              className="ml-auto hidden md:block"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Step 2 of 4
              </Badge>
            </motion.div>
          </motion.div>
        </CardHeader>
        <CardContent className="p-8">
          {/* Main Accordion Wrapper */}
          <Accordion type="single" defaultValue="categories-products" collapsible className="space-y-6">

            {/* Section 1: Categories and Products */}
            <AccordionItem
              value="categories-products"
              className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <Package className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                        Categories and Products
                      </h3>
                      <p className="text-sm text-gray-600 font-normal">Organize your products into categories</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-3 py-1">
                    <Package className="w-3 h-3 mr-1" />
                    {categories.filter(c => c.name?.trim()).length} Categories
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                {/* Category Management */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    {categories.filter(c => c.name?.trim()).length > 0
                      ? `${categories.filter(c => c.name?.trim()).length} categories added`
                      : 'No categories added yet'}
                  </p>
                  <Button
                    onClick={addCategory}
                    size="sm"
                    className="bg-gradient-to-r from-teal-500 to-slate-600 text-white hover:shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>

                {/* Categories Display */}
                {categories.length > 0 ? (
                  <Accordion type="single" collapsible className="space-y-6">
              {categories.map((category, categoryIndex) => {
                
                return (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <AccordionItem 
                  value={`category-${categoryIndex}`} 
                  className="border-2 border-teal-200/50 rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-teal-500 to-slate-600 rounded-xl flex items-center justify-center shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="text-white font-bold">{categoryIndex + 1}</span>
                        </motion.div>
                        <div>
                          <Badge 
                            variant="outline" 
                            className="mb-2 bg-teal-100 border-teal-300 text-teal-700">
                          
                            <Star className="w-3 h-3 mr-1" />
                            Category {categoryIndex + 1}
                          </Badge>
                          <div className="font-semibold text-lg text-gray-900">
                            {category.name || `Unnamed Category ${categoryIndex + 1}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {category.products.length} product{category.products.length !== 1 ? 's' : ''} configured
                          </div>
                        </div>
                      </div>
                      {categories.length > 1 && (
                        <motion.div
                          onClick={(e) => {
                            e.stopPropagation()
                            removeCategory(categoryIndex)
                          }}
                          className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 cursor-pointer transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {/* Category Information - Compact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Category Name *</Label>
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                          placeholder="e.g., Organic Fertilizers"
                          className="border-2 border-teal-200/50 focus:border-teal-500 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <Textarea
                          value={category.description}
                          onChange={(e) => updateCategory(categoryIndex, 'description', e.target.value)}
                          placeholder="Brief description of this category"
                          rows={2}
                          className="border-2 border-teal-200/50 focus:border-teal-500 bg-white resize-none"
                        />
                      </div>
                    </div>

                    {/* Products in Category */}
                    <motion.div 
                      className="bg-gradient-to-br from-teal-50/50 to-slate-50/50 rounded-2xl p-6 border border-teal-100/50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-lg text-gray-900">Products Portfolio</h4>
                          <Badge className="bg-teal-100 border-teal-300 text-teal-700">
                            {category.products.length} items
                          </Badge>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => openAddProductModal(categoryIndex)}
                            className="bg-gradient-to-r from-teal-500 to-slate-600 text-white hover:shadow-md px-4 py-2 rounded-xl"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Product
                          </Button>
                        </motion.div>
                      </div>

                      {category.products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {category.products.map((product, productIndex) => (
                          <motion.div
                            key={productIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: productIndex * 0.1 }}
                            className="border-2 border-teal-200/50 rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50/30 shadow-lg hover:shadow-xl transition-all duration-300 relative"
                            whileHover={{ y: -2, scale: 1.02 }}
                          >
                            {/* Product Card Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <motion.div
                                  className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md"
                                  whileHover={{ rotate: 10 }}
                                >
                                  <span className="text-white font-bold text-sm">{productIndex + 1}</span>
                                </motion.div>
                                <Badge 
                                  variant="secondary" 
                                  className="bg-teal-100 border-teal-300 text-teal-700"
                                >
                                  <Package className="w-3 h-3 mr-1" />
                                  Product
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <motion.button
                                  onClick={() => openEditProductModal(categoryIndex, productIndex)}
                                  className="p-2 rounded-lg bg-teal-100 text-teal-600 hover:bg-teal-200 hover:text-teal-700 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Edit className="w-4 h-4" />
                                </motion.button>
                                {category.products.length > 1 && (
                                  <motion.button
                                    onClick={() => removeProduct(categoryIndex, productIndex)}
                                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                )}
                              </div>
                            </div>

                            {/* Product Card Content */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                                  {product.name || 'Untitled Product'}
                                </h4>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                  {product.description || 'No description provided'}
                                </p>
                                {product.hsn_code && (
                                  <Badge variant="outline" className="text-xs bg-gray-50">
                                    HSN: {product.hsn_code}
                                  </Badge>
                                )}
                              </div>

                              {/* Quick Info */}
                              <div className="space-y-2">
                                {product.specifications.grade && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Shield className="w-3 h-3 text-teal-500" />
                                    <span className="text-gray-600">Grade: {product.specifications.grade}</span>
                                  </div>
                                )}
                                {product.specifications.origin && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Globe className="w-3 h-3 text-teal-500" />
                                    <span className="text-gray-600">Origin: {product.specifications.origin}</span>
                                  </div>
                                )}
                                {product.specifications.moq && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Package className="w-3 h-3 text-teal-500" />
                                    <span className="text-gray-600">MOQ: {product.specifications.moq}</span>
                                  </div>
                                )}
                              </div>

                              {/* Benefits Count */}
                              {product.key_benefits.filter(b => b.trim()).length > 0 && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Star className="w-3 h-3 text-amber-500" />
                                  <span className="text-gray-600">
                                    {product.key_benefits.filter(b => b.trim()).length} key benefits
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Edit Button */}
                            <motion.button
                              onClick={() => openEditProductModal(categoryIndex, productIndex)}
                              className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Edit className="w-4 h-4" />
                              Edit Product Details
                            </motion.button>
                          </motion.div>
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-6 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/30"
                        >
                          <Package className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-1">No products added yet</p>
                          <p className="text-xs text-gray-500">Click the button above to add your products</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
                );
              })}
            </Accordion>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/30"
            >
              <Package className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">No category added yet</p>
              <p className="text-xs text-gray-500">Click the button above to add your category</p>
            </motion.div>
          )}
              </AccordionContent>
            </AccordionItem>

            {/* Section 2: Global Export Markets */}
            <AccordionItem
              value="export-markets"
              className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05, rotate: -5 }}
                    >
                      <Globe className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
                        Global Export Markets
                      </h3>
                      <p className="text-sm text-gray-600 font-normal">Select your target export destinations</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1">
                    <Globe className="w-3 h-3 mr-1" />
                    {exportCountries.length} Selected
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <CardContent className="space-y-4">
                  
                  {/* Country Selection */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <MultiSelect
                      options={exportContriesWithFlags.map(c => ({ value: c.country_name, label: c.country_name }))}
                      selected={exportCountries.map(c => c.country_name)}
                      onSelectionChange={(selectedNames) => {
                        const selectedCountries = exportContriesWithFlags.filter(c => selectedNames.includes(c.country_name)).map(c => ({
                          country_name: c.country_name,
                          flag_url: c.image_url
                        }))
                        onUpdateCountries(selectedCountries)
                      }}
                      placeholder="Select target export countries..."
                      searchPlaceholder="Search countries..."
                      className="border-2 border-teal-200/50 focus-within:border-teal-500 bg-white transition-colors duration-200"
                      clearable={true}
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Choose multiple destinations for your export business
                    </p>
                  </motion.div>

                  {/* Selected Countries - Compact Display */}
                  {exportCountries.length > 0 ? (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex flex-wrap gap-3">
                        {exportCountries.map((country, index) => (
                          <motion.div
                            key={country.country_name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="relative group"
                            whileHover={{ scale: 1.1 }}
                          >
                            <img
                              src={country.flag_url}
                              alt={country.country_name}
                              title={country.country_name}
                              className="w-12 h-9 object-cover rounded-md shadow-md border-2 border-teal-200/50 hover:border-teal-400 transition-all duration-200 cursor-pointer"
                            />
                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                              {country.country_name}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/30"
                    >
                      <Globe className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">No markets selected yet</p>
                      <p className="text-xs text-gray-500">Select countries from the dropdown above</p>
                    </motion.div>
                  )}
                </CardContent>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: Certifications & Credentials */}
            <AccordionItem
              value="certifications"
              className="border-2 border-teal-200/50 rounded-2xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-teal-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 10 }}
                    >
                      <Award className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-700 bg-clip-text text-transparent">
                        Certifications & Credentials
                      </h3>
                      <p className="text-sm text-gray-600 font-normal">Showcase your quality standards and compliance</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-slate-500 text-white px-3 py-1">
                    <Shield className="w-3 h-3 mr-1" />
                    {certifications.filter(c => c.name?.trim()).length} Certified
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <CardContent className="space-y-4">
                  
                  {/* Certification Management */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      {certifications.filter(c => c.name?.trim()).length > 0 
                        ? `${certifications.filter(c => c.name?.trim()).length} certifications added` 
                        : 'No certifications added yet'}
                    </p>
                    <Button 
                      onClick={openAddCertificationModal}
                      size="sm"
                      className="bg-gradient-to-r from-teal-500 to-slate-600 text-white hover:shadow-md"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Certification
                    </Button>
                  </div>

                  {/* Certifications Display - Same style as Products */}
                  {certifications.filter(cert => cert.name?.trim()).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {certifications.filter(cert => cert.name?.trim()).map((cert, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-2 border-teal-200/50 rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50/30 shadow-lg hover:shadow-xl transition-all duration-300 relative"
                          whileHover={{ y: -2, scale: 1.02 }}
                        >
                          {/* Certification Card Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <motion.div
                                className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md"
                                whileHover={{ rotate: 10 }}
                              >
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </motion.div>
                              <Badge 
                                variant="secondary" 
                                className="bg-teal-100 border-teal-300 text-teal-700"
                              >
                                <Award className="w-3 h-3 mr-1" />
                                Certificate
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                onClick={() => openEditCertificationModal(index)}
                                className="p-2 rounded-lg bg-teal-100 text-teal-600 hover:bg-teal-200 hover:text-teal-700 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              {certifications.length > 1 && (
                                <motion.button
                                  onClick={() => removeCertification(index)}
                                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              )}
                            </div>
                          </div>

                          {/* Certification Card Content */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                                {cert.name || 'Quality Certification'}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {cert.description || 'Quality assurance certification'}
                              </p>
                              {cert.issuing_authority && (
                                <Badge variant="outline" className="text-xs bg-gray-50">
                                  Authority: {cert.issuing_authority}
                                </Badge>
                              )}
                            </div>

                            {/* Quick Info */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs">
                                <Shield className="w-3 h-3 text-teal-500" />
                                <span className="text-gray-600">Certified Quality Standard</span>
                              </div>
                              {cert.certificate_image_url && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Image className="w-3 h-3 text-teal-500" />
                                  <span className="text-gray-600">Certificate Available</span>
                                </div>
                              )}
                              {cert.certificate_pdf_url && (
                                <div className="flex items-center gap-2 text-xs">
                                  <FileText className="w-3 h-3 text-teal-500" />
                                  <span className="text-gray-600">PDF Document</span>
                                </div>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 text-xs">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-gray-600">Active Certification</span>
                            </div>
                          </div>

                          {/* Edit Button */}
                          <motion.button
                            onClick={() => openEditCertificationModal(index)}
                            className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit Certificate Details
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/30"
                    >
                      <Award className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">No certifications added yet</p>
                      <p className="text-xs text-gray-500">Click the button above to add your quality certifications</p>
                    </motion.div>
                  )}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>


      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={closeProductModal}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              {isEditMode ? 'Edit Product Details' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update your product information and specifications' : 'Create a comprehensive product profile with all details and specifications'}
            </DialogDescription>
          </DialogHeader>

          {currentProduct && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Product Name *
                      <span className="text-red-400">★</span>
                    </Label>
                    <Input
                      value={currentProduct.name}
                      onChange={(e) => updateCurrentProduct('name', e.target.value)}
                      placeholder="e.g., SoilGold Organic Manure"
                      className="border-2 border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">HSN Code</Label>
                    <Input
                      value={currentProduct.hsn_code}
                      onChange={(e) => updateCurrentProduct('hsn_code', e.target.value)}
                      placeholder="e.g., 31010099"
                      className="border-2 border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Product Description</Label>
                  <Textarea
                    value={currentProduct.description}
                    onChange={(e) => updateCurrentProduct('description', e.target.value)}
                    placeholder="Detailed description highlighting key features and benefits..."
                    rows={4}
                    className="border-2 border-teal-200/50 focus:border-teal-500 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <ImageUpload
                    value={currentProduct.image_url}
                    onValueChange={(value) => updateCurrentProduct('image_url', value)}
                    label="Product Image"
                    placeholder="Enter image URL or upload product image"
                    type="product"
                    icon={Package}
                    iconColor="#14B8A6"
                    className="border-2 border-teal-200/50 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  Product Specifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Quality Grade</Label>
                    <Input
                      value={currentProduct.specifications.grade}
                      onChange={(e) => updateCurrentProductSpec('grade', e.target.value)}
                      placeholder="Export Grade A"
                      className="border border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Origin</Label>
                    <Input
                      value={currentProduct.specifications.origin}
                      onChange={(e) => updateCurrentProductSpec('origin', e.target.value)}
                      placeholder="India"
                      className="border border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Color</Label>
                    <Input
                      value={currentProduct.specifications.color}
                      onChange={(e) => updateCurrentProductSpec('color', e.target.value)}
                      placeholder="Natural Green"
                      className="border border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Purity</Label>
                    <Input
                      value={currentProduct.specifications.purity}
                      onChange={(e) => updateCurrentProductSpec('purity', e.target.value)}
                      placeholder="99%"
                      className="border border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Moisture Content</Label>
                    <Input
                      value={currentProduct.specifications.moisture_content}
                      onChange={(e) => updateCurrentProductSpec('moisture_content', e.target.value)}
                      placeholder="< 10%"
                      className="border border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Shelf Life</Label>
                    <Input
                      value={currentProduct.specifications.shelf_life}
                      onChange={(e) => updateCurrentProductSpec('shelf_life', e.target.value)}
                      placeholder="24 months"
                      className="border border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Min. Order Quantity</Label>
                    <Input
                      value={currentProduct.specifications.moq}
                      onChange={(e) => updateCurrentProductSpec('moq', e.target.value)}
                      placeholder="1000 kg"
                      className="border border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Lead Time</Label>
                    <Input
                      value={currentProduct.specifications.lead_time}
                      onChange={(e) => updateCurrentProductSpec('lead_time', e.target.value)}
                      placeholder="15-20 days"
                      className="border border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Key Benefits & USPs
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCurrentProductBenefit}
                    className="border-teal-200 hover:bg-teal-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Benefit
                  </Button>
                </div>
                <div className="space-y-3">
                  {currentProduct.key_benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => updateCurrentProductBenefit(index, e.target.value)}
                        placeholder={`Benefit ${index + 1}: e.g., 100% Organic and Natural`}
                        className="flex-1 border border-teal-200/50 focus:border-teal-500"
                      />
                      {currentProduct.key_benefits.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCurrentProductBenefit(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={closeProductModal}>
                  Cancel
                </Button>
                <Button 
                  onClick={saveProduct}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                  disabled={!currentProduct.name.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Certification Modal */}
      <Dialog open={isCertificationModalOpen} onOpenChange={closeCertificationModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-slate-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              {isEditMode ? 'Edit Certification Details' : 'Add New Certification'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update your certification information and credentials' : 'Add a quality certification to showcase your standards and compliance'}
            </DialogDescription>
          </DialogHeader>

          {currentCertification && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Certification Name *
                      <span className="text-red-400">★</span>
                    </Label>
                    <Combobox
                      value={currentCertification.name}
                      onValueChange={(value) => updateCurrentCertification('name', value)}
                      options={certificationOptions}
                      placeholder="Select certification standard..."
                      searchPlaceholder="Search certifications..."
                      className="border-2 border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Issuing Authority *
                      <span className="text-red-400">★</span>
                    </Label>
                    <Combobox
                      value={currentCertification.issuing_authority}
                      onValueChange={(value) => updateCurrentCertification('issuing_authority', value)}
                      options={authorityOptions}
                      placeholder="Select certifying body..."
                      searchPlaceholder="Search authorities..."
                      className="border-2 border-teal-200/50 focus:border-teal-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Certification Description
                    <FileText className="w-4 h-4" />
                  </Label>
                  <Textarea
                    value={currentCertification.description}
                    onChange={(e) => updateCurrentCertification('description', e.target.value)}
                    placeholder="Brief description highlighting the certification's importance and scope..."
                    rows={4}
                    className="border-2 border-teal-200/50 focus:border-teal-500 resize-none"
                  />
                </div>
              </div>

              {/* Certificate Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Certificate Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ImageUpload
                      value={currentCertification.certificate_image_url || ''}
                      onValueChange={(value) => updateCurrentCertification('certificate_image_url', value)}
                      label="Certificate Image"
                      placeholder="Enter image URL or upload certificate image"
                      type="certificate"
                      icon={Award}
                      iconColor="#F59E0B"
                      className="border-2 border-teal-200/50 focus:border-teal-500"
                    />
                    <p className="text-xs text-gray-500">High-quality image of your certificate</p>
                  </div>
                  <div className="space-y-2">
                    <ImageUpload
                      value={currentCertification.certificate_pdf_url || ''}
                      onValueChange={(value) => updateCurrentCertification('certificate_pdf_url', value)}
                      label="Certificate PDF"
                      placeholder="Enter PDF URL or upload certificate document"
                      type="certificate"
                      acceptPDF={true}
                      icon={FileText}
                      iconColor="#EF4444"
                      className="border-2 border-teal-200/50 focus:border-teal-500"
                    />
                    <p className="text-xs text-gray-500">PDF document of the certificate</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={closeCertificationModal}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={saveCertification}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 flex-1"
                  disabled={!currentCertification.name.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Certification' : 'Add Certification'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}