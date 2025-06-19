import { OffenderIdentifierType } from '../interfaces/prisonApi/OffenderIdentifierType'

export interface IdentifierMapping {
  type: string
  label: string
  editPageUrl: string
  hint?: string
}

export const JusticeIdentifierMappings: Record<string, IdentifierMapping> = {
  cro: {
    type: OffenderIdentifierType.CroNumber,
    label: 'CRO number',
    editPageUrl: 'cro',
    hint: 'Enter the CRO number exactly as it appears on the document. It should be between 5 and 12 characters long and include a slash (/) and letters.',
  },
  pnc: {
    type: OffenderIdentifierType.PncNumber,
    label: 'PNC number',
    editPageUrl: 'pnc',
    hint: 'Enter the PNC number exactly as it appears on the document. It should be between 5 and 13 characters long, include a slash (/) and end in a letter.',
  },
  prisonLegacySystem: {
    type: OffenderIdentifierType.PrisonLegacySystemNumber,
    label: 'Prison legacy system number',
    editPageUrl: 'prison-legacy-system',
  },
  probationLegacySystem: {
    type: OffenderIdentifierType.ProbationLegacySystemNumber,
    label: 'Probation legacy system number',
    editPageUrl: 'probation-legacy-system',
  },
  scottishPnc: {
    type: OffenderIdentifierType.ScottishPncNumber,
    label: 'Scottish PNC number',
    editPageUrl: 'scottish-pnc',
  },
  yjaf: {
    type: OffenderIdentifierType.YjafNumber,
    label: 'Youth Justice Application Framework (YJAF) number',
    editPageUrl: 'yjaf',
  },
}

export const PersonalIdentifierMappings: Record<string, IdentifierMapping> = {
  drivingLicence: {
    type: OffenderIdentifierType.DrivingLicenseNumber,
    label: 'Driving licence number',
    editPageUrl: 'driving-licence',
  },
  nationalInsurance: {
    type: OffenderIdentifierType.NationalInsuranceNumber,
    label: 'National Insurance number',
    editPageUrl: 'national-insurance',
  },
  parkrun: {
    type: OffenderIdentifierType.ParkrunNumber,
    label: 'parkrun number',
    editPageUrl: 'parkrun',
  },
  passport: {
    type: OffenderIdentifierType.PassportNumber,
    label: 'Passport number',
    editPageUrl: 'passport',
  },
  staffId: {
    type: OffenderIdentifierType.StaffIdentityCardNumber,
    label: 'Staff ID card number',
    editPageUrl: 'staff-id',
  },
  uln: {
    type: OffenderIdentifierType.UniqueLearnerNumber,
    label: 'Unique learner number (ULN)',
    editPageUrl: 'uln',
  },
}

export const HomeOfficeIdentifierMappings: Record<string, IdentifierMapping> = {
  cid: {
    type: OffenderIdentifierType.CaseInformationDatabase,
    label: 'Case Information Database (CID)',
    editPageUrl: 'cid',
  },
  homeOfficeReference: {
    type: OffenderIdentifierType.HomeOfficeReferenceNumber,
    label: 'Home Office reference number',
    editPageUrl: 'home-office-reference',
  },
  portReference: {
    type: OffenderIdentifierType.PortReferenceNumber,
    label: 'Port reference number',
    editPageUrl: 'port-reference',
  },
}

export const IdentifierMappings: Record<string, IdentifierMapping> = {
  ...JusticeIdentifierMappings,
  ...PersonalIdentifierMappings,
  ...HomeOfficeIdentifierMappings,
}
