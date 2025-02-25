export interface ReferenceDataCode {
  id: string
  domain: string
  code: string
  description: string
  listSequence: number
  createdAt: string
  createdBy: string
  isActive: boolean
  lastModifiedAt?: string
  lastModifiedBy?: string
  deactivatedAt?: string
  deactivatedBy?: string
}
