import DocumentMeta from './DocumentMeta'

export default interface DocumentSearchResponse {
  request: DocumentSearchRequest
  results: DocumentMeta[]
  totalResultsCount: number
}

interface DocumentSearchRequest {
  documentType?: 'PRISONER_PROFILE_PICTURE'
  metadata?: Record<string, string>
  page?: number
  pageSize?: number
  orderBy?: 'FILENAME' | 'FILE_EXTENSION' | 'FILESIZE' | 'CREATED_TIME'
  orderByDirection?: 'ASC' | 'DESC'
}
