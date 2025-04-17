import Assessment from './Assessment'
import Alias from './Alias'
import OffenderSentenceTerms from './OffenderSentenceTerms'
import OffenceHistoryDetail from './OffenceHistoryDetail'
import SentenceCalcDates from './SentenceCalcDates'
import { PersonalCareNeed } from './PersonalCareNeeds'
import AssignedLivingUnit from './AssignedLivingUnit'
import PhysicalAttributes from './PhysicalAttributes'
import PhysicalCharacteristic from './PhysicalCharacteristic'
import PhysicalMark from './PhysicalMark'
import OffenderIdentifier from './OffenderIdentifier'
import ProfileInformation from './ProfileInformation'

export default interface InmateDetail {
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
