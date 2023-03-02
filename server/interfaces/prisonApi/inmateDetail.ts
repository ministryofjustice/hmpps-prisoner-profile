import { Assessment } from './assessment'
import { Alert } from './alert'
import { Alias } from './alias'
import { OffenderSentenceTerms } from './offenderSentenceTerms'
import { OffenceHistoryDetail } from './offenceHistoryDetail'
import { SentenceCalcDates } from './sentenceCalcDates'
import { PersonalCareNeed } from './personalCareNeed'
import { AssignedLivingUnit } from './assignedLivingUnit'
import { PhysicalAttributes } from './physicalAttributes'
import { PhysicalCharacteristic } from './physicalCharacteristic'
import { PhysicalMark } from './physicalMark'
import { OffenderIdentifier } from './offenderIdentifier'
import { ProfileInformation } from './profileInformation'

export interface InmateDetail {
  offenderNo: string
  bookingId?: number
  bookingNo?: string
  offenderId: number
  rootOffenderId: number
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: string
  age?: number
  activeFlag: boolean
  facialImageId?: number
  agencyId?: string
  assignedLivingUnitId?: number
  religion?: string
  language?: string
  interpreterRequired?: boolean
  writtenLanguage?: string
  alertsCodes?: string[]
  activeAlertCount?: number
  inactiveAlertCount?: number
  alerts?: Alert[]
  assignedLivingUnit?: AssignedLivingUnit
  physicalAttributes?: PhysicalAttributes
  physicalCharacteristics?: PhysicalCharacteristic[]
  profileInformation?: ProfileInformation[]
  physicalMarks?: PhysicalMark[]
  assessments?: Assessment[]
  csra?: string
  csraClassificationCode?: string
  csraClassificationDate?: string
  category?: string
  categoryCode?: string
  birthPlace?: string
  birthCountryCode?: string
  inOutStatus: 'IN' | 'OUT' | 'TRN'
  identifiers?: OffenderIdentifier[]
  personalCareNeeds?: PersonalCareNeed[]
  sentenceDetail?: SentenceCalcDates
  offenceHistory?: OffenceHistoryDetail[]
  sentenceTerms?: OffenderSentenceTerms[]
  aliases?: Alias[]
  status: 'ACTIVE IN' | 'ACTIVE OUT'
  statusReason?: string
  lastMovementTypeCode?: 'TAP' | 'CRT' | 'TRN' | 'ADM' | 'REL'
  lastMovementReasonCode?: string
  legalStatus?:
    | 'RECALL'
    | 'DEAD'
    | 'INDETERMINATE_SENTENCE'
    | 'SENTENCED'
    | 'CONVICTED_UNSENTENCED'
    | 'CIVIL_PRISONER'
    | 'IMMIGRATION_DETAINEE'
    | 'REMAND'
    | 'UNKNOWN'
    | 'OTHER'
  recall?: boolean
  imprisonmentStatus?: string
  imprisonmentStatusDescription?: string
  receptionDate?: string
  locationDescription?: string
  latestLocationId?: string
}
