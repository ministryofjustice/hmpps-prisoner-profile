export default interface DocumentMeta {
  documentUuid: string
  documentName: 'PRISONER_PROFILE_PICTURE'
  documentFileName: string
  fileName: string
  fileExtension: string
  fileSize: number
  fileHash: string
  mimeType: string
  metadata: Record<string, string>
  createdTime: string
  createdByServiceName: string
  createdByUsername: string
}
