import OffenderIdentifier from '../../../data/interfaces/prisonApi/OffenderIdentifier'
import { IdentifierMapping } from '../../../data/constants/identifierMappings'
import { capitaliseFirstLetter, sortByDateTime } from '../../../utils/utils'

export interface AddIdentityNumberOption {
  id: string
  label: string
  description: string
  selected: boolean
  mostRecentExistingValue?: string
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
    const existingIdentifiersOfType = existingIdentifiers
      .filter(item => item.type === mapping.type)
      .sort((a, b) => sortByDateTime(b.whenCreated, a.whenCreated))
    const mostRecentExistingValue =
      existingIdentifiersOfType.length > 0 ? existingIdentifiersOfType[0].value : undefined
    return {
      id,
      label: capitaliseFirstLetter(mapping.description),
      description: mapping.description,
      hint: mapping.hint,
      selected: formValues?.[id]?.selected !== undefined,
      value: formValues?.[id]?.value || undefined,
      comment: formValues?.[id]?.comment || undefined,
      mostRecentExistingValue,
    }
  })
}
