export interface CaseNoteType {
  code: string
  description: string
  activeFlag: string
  sensitive: boolean
  restrictedUse: boolean
  subCodes: CaseNoteType[]
}
