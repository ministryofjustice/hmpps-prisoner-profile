import { OffenderIdentifierType } from '../interfaces/prisonApi/OffenderIdentifier'

export interface IdentifierMapping {
  type: string
  label: string
  hint?: string
}

export const JusticeIdentifierMappings: Record<string, IdentifierMapping> = {
  cro: {
    type: OffenderIdentifierType.CroNumber,
    label: 'CRO number',
    hint: 'Enter the CRO number exactly as it appears on the document. It should be between 5 and 12 characters long and include a slash (/) and letters.',
  },
  pnc: {
    type: OffenderIdentifierType.PncNumber,
    label: 'PNC number',
    hint: 'Enter the PNC number exactly as it appears on the document. It should be between 5 and 13 characters long, include a slash (/) and end in a letter.',
  },
  prisonLegacySystem: {
    type: OffenderIdentifierType.PrisonLegacySystemNumber,
    label: 'Prison legacy system number',
  },
  probationLegacySystem: {
    type: OffenderIdentifierType.ProbationLegacySystemNumber,
    label: 'Probation legacy system number',
  },
  scottishPnc: {
    type: OffenderIdentifierType.ScottishPncNumber,
    label: 'Scottish PNC number',
  },
  yjaf: {
    type: OffenderIdentifierType.YjafNumber,
    label: 'Youth Justice Application Framework (YJAF) number',
  },
}

export const PersonalIdentifierMappings: Record<string, IdentifierMapping> = {
  drivingLicence: {
    type: OffenderIdentifierType.DrivingLicenseNumber,
    label: 'Driving licence number',
  },
  nationalInsurance: {
    type: OffenderIdentifierType.NationalInsuranceNumber,
    label: 'National Insurance number',
  },
  parkrun: {
    type: OffenderIdentifierType.ParkrunNumber,
    label: 'parkrun number',
  },
  passport: {
    type: OffenderIdentifierType.PassportNumber,
    label: 'Passport number',
  },
  staffId: {
    type: OffenderIdentifierType.StaffIdentityCardNumber,
    label: 'Staff ID card number',
  },
  uln: {
    type: OffenderIdentifierType.UniqueLearnerNumber,
    label: 'Unique learner number (ULN)',
  },
}

export const HomeOfficeIdentifierMappings: Record<string, IdentifierMapping> = {
  cid: {
    type: OffenderIdentifierType.CaseInformationDatabase,
    label: 'Case Information Database (CID)',
  },
  homeOfficeReference: {
    type: OffenderIdentifierType.HomeOfficeReferenceNumber,
    label: 'Home office reference number',
  },
  portReference: {
    type: OffenderIdentifierType.PortReferenceNumber,
    label: 'Port reference number',
  },
}

export const IdentifierMappings: Record<string, IdentifierMapping> = {
  ...JusticeIdentifierMappings,
  ...PersonalIdentifierMappings,
  ...HomeOfficeIdentifierMappings,
}
