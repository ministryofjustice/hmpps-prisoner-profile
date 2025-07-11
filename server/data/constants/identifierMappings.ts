import { OffenderIdentifierType } from '../interfaces/prisonApi/OffenderIdentifierType'

export interface IdentifierMapping {
  type: string
  description: string
  editPageUrl: string
  hint?: string
}

export const JusticeIdentifierMappings: Record<string, IdentifierMapping> = {
  cro: {
    type: OffenderIdentifierType.CroNumber,
    description: 'CRO number',
    editPageUrl: 'cro',
    hint: 'Enter the CRO number exactly as it appears on the document. It should be between 5 and 12 characters long and include a slash (/) and letters.',
  },
  pnc: {
    type: OffenderIdentifierType.PncNumber,
    description: 'PNC number',
    editPageUrl: 'pnc',
    hint: 'Enter the PNC number exactly as it appears on the document. It should be between 5 and 13 characters long, include a slash (/) and end in a letter.',
  },
  prisonLegacySystem: {
    type: OffenderIdentifierType.PrisonLegacySystemNumber,
    description: 'prison legacy system number',
    editPageUrl: 'prison-legacy-system',
  },
  probationLegacySystem: {
    type: OffenderIdentifierType.ProbationLegacySystemNumber,
    description: 'probation legacy system number',
    editPageUrl: 'probation-legacy-system',
  },
  scottishPnc: {
    type: OffenderIdentifierType.ScottishPncNumber,
    description: 'Scottish PNC number',
    editPageUrl: 'scottish-pnc',
  },
  yjaf: {
    type: OffenderIdentifierType.YjafNumber,
    description: 'Youth Justice Application Framework (YJAF) number',
    editPageUrl: 'yjaf',
  },
}

export const PersonalIdentifierMappings: Record<string, IdentifierMapping> = {
  drivingLicence: {
    type: OffenderIdentifierType.DrivingLicenseNumber,
    description: 'driving licence number',
    editPageUrl: 'driving-licence',
  },
  nationalInsurance: {
    type: OffenderIdentifierType.NationalInsuranceNumber,
    description: 'National Insurance number',
    editPageUrl: 'national-insurance',
  },
  parkrun: {
    type: OffenderIdentifierType.ParkrunNumber,
    description: 'parkrun number',
    editPageUrl: 'parkrun',
  },
  passport: {
    type: OffenderIdentifierType.PassportNumber,
    description: 'passport number',
    editPageUrl: 'passport',
  },
  staffId: {
    type: OffenderIdentifierType.StaffIdentityCardNumber,
    description: 'staff ID card number',
    editPageUrl: 'staff-id',
  },
  uln: {
    type: OffenderIdentifierType.UniqueLearnerNumber,
    description: 'unique learner number (ULN)',
    editPageUrl: 'uln',
  },
}

export const HomeOfficeIdentifierMappings: Record<string, IdentifierMapping> = {
  cid: {
    type: OffenderIdentifierType.CaseInformationDatabase,
    description: 'Case Information Database (CID) number',
    editPageUrl: 'cid',
  },
  homeOfficeReference: {
    type: OffenderIdentifierType.HomeOfficeReferenceNumber,
    description: 'Home Office reference number',
    editPageUrl: 'home-office-reference',
  },
  portReference: {
    type: OffenderIdentifierType.PortReferenceNumber,
    description: 'port reference number',
    editPageUrl: 'port-reference',
  },
}

export const IdentifierMappings: Record<string, IdentifierMapping> = {
  ...JusticeIdentifierMappings,
  ...PersonalIdentifierMappings,
  ...HomeOfficeIdentifierMappings,
}
