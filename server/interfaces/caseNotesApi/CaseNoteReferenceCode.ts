export interface CaseNoteReferenceCode {
  code: string
  description: string
  activeFlag: 'Y' | 'N'
  subCodes: CaseNoteReferenceCode[]
  sensitive: boolean
  restrictedUse: boolean
}
