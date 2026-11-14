// ============================================================
// Auth
// ============================================================

// A custom dashboard role (Settings → Rôles) — roles are admin-created data,
// not a fixed set. `sections` is the per-nav-section view/edit access matrix.
export interface AuthUserRole {
  id: string
  name: string
  sections: { section: string; canView: boolean; canEdit: boolean }[]
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: AuthUserRole | null
  avatar?: string
  status: 'ACTIVE' | 'SUSPENDED'
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

// ============================================================
// Roles
// ============================================================

export interface RoleSectionAccess {
  section: string
  canView: boolean
  canEdit: boolean
}

export interface Role {
  id: string
  name: string
  description?: string | null
  isSystem: boolean
  sections: RoleSectionAccess[]
  _count?: { users: number }
  createdAt: string
  updatedAt: string
}

export interface RolePayload {
  name: string
  description?: string
  sections: RoleSectionAccess[]
}

// ============================================================
// Members (staff)
// ============================================================

export interface StaffMember {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  status: 'ACTIVE' | 'SUSPENDED'
  roleId: string | null
  roleRef: { id: string; name: string } | null
  lastLoginAt: string | null
  createdAt: string
}

export interface CreateStaffPayload {
  firstName: string
  lastName: string
  email: string
  roleId: string
}

export interface UpdateStaffPayload {
  firstName?: string
  lastName?: string
  email?: string
  roleId?: string
  status?: 'ACTIVE' | 'SUSPENDED'
}

// ============================================================
// Content collections
// ============================================================

export interface ServiceFeature {
  name: string
  description?: string
  icon?: string
}

export interface Service {
  id: string
  title: string
  slug: string
  eyebrow?: string | null
  color?: string | null
  link?: string | null
  reverse: boolean
  description?: string | null
  imageId?: string | null
  imageUrl?: string | null
  sortOrder: number
  features: ServiceFeature[]
  createdAt: string
  updatedAt: string
}

export type ClientCategory = 'BRAND' | 'ARTIST' | 'STRATEGIC_CLIENT'

export interface Client {
  id: string
  name: string
  logoId?: string | null
  imageUrl?: string | null
  link?: string | null
  sector?: string | null
  focus?: string | null
  category: ClientCategory
  active: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  name: string
  position?: string | null
  photoId?: string | null
  imageUrl?: string | null
  bio?: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface PageSection {
  id?: string
  blockType: string
  key?: string
  category?: string
  order: number
  data: Record<string, unknown>
}

export interface Page {
  id: string
  title: string
  slug: string
  seoMetaTitle?: string | null
  seoMetaDescription?: string | null
  seoOgImageUrl?: string | null
  sections: PageSection[]
  createdAt: string
  updatedAt: string
}

export type SubmissionType = 'CONTACT' | 'QUOTE' | 'RESERVATION'
export type SubmissionStatus = 'PENDING' | 'SENT' | 'FAILED'
export type SubmissionLifecycle = 'NEW' | 'IN_PROGRESS' | 'CLOSED'

export interface Submission {
  id: string
  type: SubmissionType
  name: string
  email: string
  phone?: string | null
  message?: string | null
  clientType?: string | null
  projectType?: string | null
  budget?: string | null
  date?: string | null
  hours: string[]
  status: SubmissionStatus
  lifecycle: SubmissionLifecycle
  read: boolean
  createdAt: string
  updatedAt: string
}

export type ArticleStatus = 'DRAFT' | 'PUBLISHED'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  coverImageId?: string | null
  coverImageUrl?: string | null
  content?: string | null
  status: ArticleStatus
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type PortfolioCategory =
  | 'VIDEO' | 'GRAPHISME' | 'SHOOTING' | 'SITE_WEB' | 'STRATEGIE' | 'RESEAUX_SOCIAUX'

export interface PortfolioProject {
  id: string
  title: string
  slug: string
  client?: string | null
  coverId?: string | null
  coverUrl?: string | null
  gallery: string[]
  description?: string | null
  sortOrder: number
  category: PortfolioCategory
  videoUrl?: string | null
  year?: number | null
  services: string[]
  need?: string | null
  approach?: string | null
  result?: string | null
  createdAt: string
  updatedAt: string
}

export interface Testimonial {
  id: string
  name: string
  role?: string | null
  company?: string | null
  photoId?: string | null
  photoUrl?: string | null
  quote: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface PricingPackage {
  id: string
  title: string
  price?: number | null
  features: string[]
  highlighted: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  filename: string
  url: string
  mimeType?: string | null
  size: number
  alt?: string | null
  provider: string
  createdAt: string
}

export interface MediaUsage {
  provider: string
  usedBytes: number
  limitBytes: number | null
  usedPercent: number | null
}

// ============================================================
// Settings
// ============================================================

export interface IntegrationsConfig {
  storageProvider: 'local' | 'cloudinary' | 's3'
  cloudinaryCloudName: string
  cloudinaryApiKey: string
  cloudinaryApiSecret: string
  s3Endpoint: string
  s3Region: string
  s3Bucket: string
  s3AccessKeyId: string
  s3SecretAccessKey: string
  s3PublicUrl: string
  storageLimitGb: number
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  smtpFrom: string
  smtpFromName: string
  smtpSecure: boolean
  contactNotificationEmail: string
  quoteNotificationEmail: string
  formSubmissionToken: string
  corpSiteUrl: string
  revalidateSecret: string
}

export interface BrandingConfig {
  dashboardTitle: string
  dashboardLogoUrl: string
}
