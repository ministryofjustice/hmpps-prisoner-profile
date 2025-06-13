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

export const IdentifierMappings: Record<string, IdentifierMapping> = {
  ...JusticeIdentifierMappings,
}
