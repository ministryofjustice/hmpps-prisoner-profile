import CaseNoteSubType from './CaseNoteSubType'
import { QueryParams } from '../../../interfaces/QueryParams'

export default interface CaseNoteType {
  code: string
  description: string
  activeFlag: string
  subCodes: CaseNoteSubType[]
}

export interface CaseNotesTypeParams extends QueryParams {
  dpsUserSelectableOnly?: boolean
  includeSensitive?: boolean
  includeRestrictedUse?: boolean
  includeInactive?: boolean
}

export interface CaseNotesTypeQueryParams extends QueryParams {
  selectableBy: 'ALL' | 'DPS_USER'
  include: ('INACTIVE' | 'SENSITIVE' | 'RESTRICTED')[]
}
