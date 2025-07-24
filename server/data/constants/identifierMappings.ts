import { OffenderIdentifierType } from '../interfaces/prisonApi/OffenderIdentifierType'

export interface IdentifierMapping {
  type: string
  description: string
  editPageUrl: string
  redirectAnchor: string
  hint?: string
}

export const JusticeIdentifierMappings: Record<string, IdentifierMapping> = {
  cro: {
    type: OffenderIdentifierType.CroNumber,
    description: 'CRO number',
    editPageUrl: 'cro',
    redirectAnchor: 'cro-number',
    hint: 'Enter the CRO number exactly as it appears on the document. It should be between 5 and 12 characters long and include a slash (/) and letters.',
  },
  pnc: {
    type: OffenderIdentifierType.PncNumber,
    description: 'PNC number',
    editPageUrl: 'pnc',
    redirectAnchor: 'pnc-number',
    hint: 'Enter the PNC number exactly as it appears on the document. It should be between 5 and 13 characters long, include a slash (/) and end in a letter.',
  },
  prisonLegacySystem: {
    type: OffenderIdentifierType.PrisonLegacySystemNumber,
    description: 'prison legacy system number',
    editPageUrl: 'prison-legacy-system',
    redirectAnchor: 'prison-legacy-system-number',
  },
  probationLegacySystem: {
    type: OffenderIdentifierType.ProbationLegacySystemNumber,
    description: 'probation legacy system number',
    editPageUrl: 'probation-legacy-system',
    redirectAnchor: 'probation-legacy-system-number',
  },
  scottishPnc: {
    type: OffenderIdentifierType.ScottishPncNumber,
    description: 'Scottish PNC number',
    editPageUrl: 'scottish-pnc',
    redirectAnchor: 'scottish-pnc-number',
  },
  yjaf: {
    type: OffenderIdentifierType.YjafNumber,
    description: 'Youth Justice Application Framework (YJAF) number',
    editPageUrl: 'yjaf',
    redirectAnchor: 'yjaf-number',
  },
}

export const PersonalIdentifierMappings: Record<string, IdentifierMapping> = {
  drivingLicence: {
    type: OffenderIdentifierType.DrivingLicenseNumber,
    description: 'driving licence number',
    editPageUrl: 'driving-licence',
    redirectAnchor: 'driving-licence-number',
  },
  nationalInsurance: {
    type: OffenderIdentifierType.NationalInsuranceNumber,
    description: 'National Insurance number',
    editPageUrl: 'national-insurance',
    redirectAnchor: 'national-insurance-number',
  },
  parkrun: {
    type: OffenderIdentifierType.ParkrunNumber,
    description: 'parkrun number',
    editPageUrl: 'parkrun',
    redirectAnchor: 'parkrun-number',
  },
  passport: {
    type: OffenderIdentifierType.PassportNumber,
    description: 'passport number',
    editPageUrl: 'passport',
    redirectAnchor: 'passport-number',
  },
  staffId: {
    type: OffenderIdentifierType.StaffIdentityCardNumber,
    description: 'staff ID card number',
    editPageUrl: 'staff-id',
    redirectAnchor: 'staff-id-card-number',
  },
  uln: {
    type: OffenderIdentifierType.UniqueLearnerNumber,
    description: 'unique learner number (ULN)',
    editPageUrl: 'uln',
    redirectAnchor: 'unique-learner-number',
  },
}

export const HomeOfficeIdentifierMappings: Record<string, IdentifierMapping> = {
  cid: {
    type: OffenderIdentifierType.CaseInformationDatabase,
    description: 'Case Information Database (CID) number',
    editPageUrl: 'cid',
    redirectAnchor: 'cid-number',
  },
  homeOfficeReference: {
    type: OffenderIdentifierType.HomeOfficeReferenceNumber,
    description: 'Home Office reference number',
    editPageUrl: 'home-office-reference',
    redirectAnchor: 'home-office-reference-number',
  },
  portReference: {
    type: OffenderIdentifierType.PortReferenceNumber,
    description: 'port reference number',
    editPageUrl: 'port-reference',
    redirectAnchor: 'port-reference-number',
  },
}

export const IdentifierMappings: Record<string, IdentifierMapping> = {
  ...JusticeIdentifierMappings,
  ...PersonalIdentifierMappings,
  ...HomeOfficeIdentifierMappings,
}
