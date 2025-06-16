import OffenderIdentifier from '../../../data/interfaces/prisonApi/OffenderIdentifier'
import { IdentifierMapping } from '../../../data/constants/identifierMappings'

export interface AddIdentityNumberOption {
  id: string
  label: string
  selected: boolean
  hasExistingValue: boolean
  hint?: string
  value?: string
  comment?: string
}

export interface AddIdentityNumberSubmission {
  selected?: string
  value?: string
  comment?: string
}

export function buildIdentityNumberOptions(
  formValues: Record<string, AddIdentityNumberSubmission>,
  existingIdentifiers: OffenderIdentifier[],
  mappings: Record<string, IdentifierMapping>,
): AddIdentityNumberOption[] {
  return Object.entries(mappings).map(([id, mapping]) => {
    return {
      id,
      label: mapping.label,
      hint: mapping.hint,
      selected: formValues?.[id]?.selected !== undefined,
      value: formValues?.[id]?.value || undefined,
      comment: formValues?.[id]?.comment || undefined,
      hasExistingValue: existingIdentifiers.some(item => item.type === mapping.type),
    }
  })
}
