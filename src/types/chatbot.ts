/**
 * Chatbot Types and Interfaces
 * Defines all TypeScript interfaces for the chatbot feature
 */

// ============================================================================
// Message Types
// ============================================================================

export type MessageRole = 'user' | 'ai' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'error';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  widget?: Widget;
  skip_available?: boolean;
  metadata?: Record<string, any>;
}

// ============================================================================
// Widget Types
// ============================================================================

export type WidgetType =
  | 'text_input'
  | 'select'
  | 'image_upload'
  | 'multi_select'
  | 'product_entry'
  | 'category_entry'
  | 'team_member_entry'
  | 'certification_entry'
  | 'ai_description'
  | 'summary_review'
  | 'skip_button';

export interface Widget {
  type: WidgetType;
  field: string;
  config?: WidgetConfig;
  onComplete?: (value: any) => void;
}

export interface WidgetConfig {
  placeholder?: string;
  accept?: string;
  maxSize?: number;
  options?: Array<{ label: string; value: string; flag?: string }>;
  multiple?: boolean;
  required?: boolean;
  [key: string]: any;
}

// ============================================================================
// Conversation State Types
// ============================================================================

export enum ConversationState {
  // Welcome & Core Business (8 states)
  WELCOME = 'welcome',
  COMPANY_NAME = 'company_name',
  COMPANY_TYPE = 'company_type',
  COMPANY_DESCRIPTION = 'company_description',
  LOGO_UPLOAD = 'logo_upload',
  YEAR_ESTABLISHED = 'year_established',
  IEC_CODE = 'iec_code',
  GST_NUMBER = 'gst_number',

  // Section Review States
  BUSINESS_INFO_REVIEW = 'business_info_review',
  CONTACT_REVIEW = 'contact_review',
  PRODUCTS_REVIEW = 'products_review',

  // Contact Information (5 states)
  CONTACT_EMAIL = 'contact_email',
  CONTACT_PHONE = 'contact_phone',
  CONTACT_WHATSAPP = 'contact_whatsapp',
  CONTACT_ADDRESS = 'contact_address',
  SOCIAL_MEDIA = 'social_media',

  // Products & Categories (7 states)
  PRODUCT_CATEGORY_START = 'product_category_start',
  CATEGORY_NAME = 'category_name',
  CATEGORY_REVIEW = 'category_review',
  PRODUCT_ITEM_START = 'product_item_start',
  PRODUCT_NAME = 'product_name',
  PRODUCT_IMAGE = 'product_image',
  PRODUCT_REVIEW = 'product_review',
  PRODUCT_HSN = 'product_hsn',
  PRODUCT_SPECS = 'product_specs',
  PRODUCT_ADD_MORE = 'product_add_more',
  CATEGORY_ADD_MORE = 'category_add_more',

  // Export & Certifications (5 states)
  EXPORT_COUNTRIES = 'export_countries',
  EXPORT_COUNTRIES_REVIEW = 'export_countries_review',
  CERTIFICATIONS_START = 'certifications_start',
  CERTIFICATION_DETAILS = 'certification_details',
  CERTIFICATIONS_REVIEW = 'certifications_review',

  // Team & Optional (2 states)
  TEAM_MEMBERS_START = 'team_members_start',
  TEAM_MEMBER_DETAILS = 'team_member_details',

  // Configuration (2 states)
  DESIGN_PREFERENCES = 'design_preferences',
  PAGE_SECTIONS = 'page_sections',

  // Final (2 states)
  REVIEW_DATA = 'review_data',
  CONFIRM_GENERATE = 'confirm_generate',
  COMPLETE = 'complete'
}

export type ConversationSection =
  | 'welcome'
  | 'business_info'
  | 'contact'
  | 'products'
  | 'export_cert'
  | 'team'
  | 'config'
  | 'review';

// ============================================================================
// Session Types
// ============================================================================

export interface ConversationSession {
  sessionId: string;
  userId: string;
  startedAt: string;
  lastUpdated: string;
  currentState: ConversationState;
  currentSection: ConversationSection;
  messages: Message[];
  collectedData: Partial<BusinessInfo>;
  context: ConversationContext;
}

export interface ConversationContext {
  expecting_input: boolean;
  current_field: string | null;
  validation_errors: string[];
  skip_available: boolean;
  retry_count: number;
  last_question: string | null;
}

// ============================================================================
// Business Info Types (matching manual form)
// ============================================================================

export interface BusinessInfo {
  // Core business
  company_name: string;
  company_type: string;
  description: string;
  logo_url?: string;
  year_established?: string;
  iec_code?: string;
  gst_number?: string;
  udyam_adhar?: string;

  // Contact
  contact: {
    email: string;
    phone: string;
    whatsapp?: string;
    address?: string;
    social_media: {
      linkedin?: string;
      facebook?: string;
      instagram?: string;
      twitter?: string;
      youtube?: string;
    };
  };

  // Categories and products
  categories: Category[];

  // Export countries
  export_countries: ExportCountry[];

  // Certifications
  certifications: Certification[];

  // Team members
  team_members: TeamMember[];
}

export interface Category {
  name: string;
  description?: string;
  products: Product[];
}

export interface Product {
  name: string;
  description?: string;
  hsn_code?: string;
  image_url?: string;
  specifications?: {
    grade?: string;
    origin?: string;
    color?: string;
    purity?: string;
    moisture_content?: string;
    shelf_life?: string;
    moq?: string;
    lead_time?: string;
  };
  key_benefits?: string[];
}

export interface ExportCountry {
  country_name: string;
  flag_url?: string;
}

export interface Certification {
  name: string;
  issuing_authority?: string;
  description?: string;
  certificate_image_url?: string;
  certificate_pdf_url?: string;
}

export interface TeamMember {
  name: string;
  designation?: string;
  image?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ChatMessageRequest {
  session_id?: string;
  message: string;
  current_state: ConversationState;
  collected_data: Partial<BusinessInfo>;
  context?: ConversationContext;
}

export interface ChatMessageResponse {
  session_id: string;
  response: string;
  next_state: ConversationState;
  section: ConversationSection;
  updated_data?: Partial<BusinessInfo>;
  widget?: Widget;
  skip_available: boolean;
  progress: {
    section: ConversationSection;
    completion_percent: number;
    fields_collected: number;
    total_fields: number;
  };
}

export interface ChatStreamChunk {
  text?: string;
  done: boolean;
  full_text?: string;
  error?: string;
  next_state?: ConversationState;
  widget?: Widget;
}

export interface SessionInitRequest {
  user_id: string;
  resume?: boolean;
}

export interface SessionInitResponse {
  session_id: string;
  current_state: ConversationState;
  messages: Message[];
  collected_data: Partial<BusinessInfo>;
  context: ConversationContext;
}

export interface ValidationRequest {
  field: string;
  value: any;
  context?: Record<string, any>;
}

export interface ValidationResponse {
  valid: boolean;
  error?: string;
  suggestions?: string[];
}

// ============================================================================
// State Sync Types
// ============================================================================

export interface StateSyncResult {
  businessInfo: BusinessInfo;
  conflicts: SyncConflict[];
  merged: boolean;
}

export interface SyncConflict {
  field: string;
  chatValue: any;
  formValue: any;
  resolved: any;
  strategy: 'chat_wins' | 'form_wins' | 'manual';
}

// ============================================================================
// UI State Types
// ============================================================================

export interface ChatUIState {
  isLoading: boolean;
  isStreaming: boolean;
  isTyping: boolean;
  error: string | null;
  scrollToBottom: boolean;
}

export interface ProgressState {
  section: ConversationSection;
  completionPercent: number;
  fieldsCollected: number;
  totalFields: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};