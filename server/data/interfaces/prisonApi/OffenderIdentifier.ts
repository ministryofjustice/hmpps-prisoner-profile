import { IdentityNumber } from '../../../services/interfaces/personalPageService/PersonalPage'

export const getOffenderIdentifierValue = (
  type: OffenderIdentifierType,
  array: OffenderIdentifier[],
): IdentityNumber[] => {
  return Array.isArray(array) && array.length
    ? array
        .filter(item => item.type === type)
        .map(item => ({
          offenderId: item.offenderId,
          sequenceId: item.offenderIdSeq,
          value: item.value,
          comment: item.issuedAuthorityText,
        }))
    : []
}

export default interface OffenderIdentifier {
  type: string
  value: string
  offenderId: number
  offenderIdSeq: number
  offenderNo?: string
  bookingId?: number
  issuedAuthorityText?: string
  issuedDate?: string
  caseloadType?: string
  whenCreated?: string
}

// eslint-disable-next-line no-shadow
export enum OffenderIdentifierType {
  CaseInformationDatabase = 'CID',
  CroNumber = 'CRO',
  DidNotEnterPrisonTaggedBailRel = 'TBRI',
  DrivingLicenseNumber = 'DL',
  HomeOfficeReferenceNumber = 'HOREF',
  LocalInmateDataSystemNumber = 'LIDS',
  NationalInsuranceNumber = 'NINO',
  ParkrunNumber = 'PARK',
  PassportNumber = 'PASS',
  PncNumber = 'PNC',
  PortReferenceNumber = 'PORT REF',
  PrisonLegacySystemNumber = 'HMPS',
  ProbationLegacySystemNumber = 'NPD',
  ScottishPncNumber = 'SPNC',
  SharedAliasWarning = 'SHARED ALIAS',
  StaffIdentityCardNumber = 'STAFF',
  UniqueLearnerNumber = 'ULN',
  YjafNumber = 'YJAF',
}
