import { IdentifierMapping } from '../../../data/constants/identifierMappings'
import {
  AddIdentityNumberOption,
  AddIdentityNumberSubmission,
  buildIdentityNumberOptions,
} from './buildIdentityNumberOptions'
import OffenderIdentifier from '../../../data/interfaces/prisonApi/OffenderIdentifier'

describe('buildIdentityNumberOptions', () => {
  const mappings: Record<string, IdentifierMapping> = {
    one: { type: 'ONE', label: 'First identifier' },
    two: { type: 'TWO', label: 'Second identifier', hint: 'Also contains letters' },
  }

  it('should build options from provided mappings', () => {
    const expected: AddIdentityNumberOption[] = [
      { id: 'one', label: 'First identifier', selected: false, hasExistingValue: false },
      {
        id: 'two',
        label: 'Second identifier',
        hint: 'Also contains letters',
        selected: false,
        hasExistingValue: false,
      },
    ]

    const result = buildIdentityNumberOptions({}, [], mappings)

    expect(result).toEqual(expected)
  })

  it('should flag existing values', () => {
    const existingValues: OffenderIdentifier[] = [
      {
        type: 'ONE',
        value: '123',
      },
      {
        type: 'THREE',
        value: '999',
      },
    ]

    const expected: AddIdentityNumberOption[] = [
      { id: 'one', label: 'First identifier', selected: false, hasExistingValue: true },
      {
        id: 'two',
        label: 'Second identifier',
        hint: 'Also contains letters',
        selected: false,
        hasExistingValue: false,
      },
    ]

    const result = buildIdentityNumberOptions({}, existingValues, mappings)

    expect(result).toEqual(expected)
  })

  it('should populate values from input form values', () => {
    const formValues: Record<string, AddIdentityNumberSubmission> = {
      one: {
        selected: '',
        value: '123',
        comment: 'Comment one',
      },
      two: {
        value: '',
      },
    }

    const expected: AddIdentityNumberOption[] = [
      {
        id: 'one',
        label: 'First identifier',
        selected: true,
        hasExistingValue: false,
        value: '123',
        comment: 'Comment one',
      },
      {
        id: 'two',
        label: 'Second identifier',
        hint: 'Also contains letters',
        selected: false,
        hasExistingValue: false,
      },
    ]

    const result = buildIdentityNumberOptions(formValues, [], mappings)

    expect(result).toEqual(expected)
  })
})
