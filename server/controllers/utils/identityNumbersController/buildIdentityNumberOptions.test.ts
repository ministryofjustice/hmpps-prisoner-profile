import { IdentifierMapping } from '../../../data/constants/identifierMappings'
import {
  AddIdentityNumberOption,
  AddIdentityNumberSubmission,
  buildIdentityNumberOptions,
} from './buildIdentityNumberOptions'
import OffenderIdentifier from '../../../data/interfaces/prisonApi/OffenderIdentifier'

describe('buildIdentityNumberOptions', () => {
  const mappings: Record<string, IdentifierMapping> = {
    one: { type: 'ONE', description: 'first identifier', editPageUrl: 'one', redirectAnchor: 'anchor-one' },
    two: {
      type: 'TWO',
      description: 'second identifier',
      hint: 'Also contains letters',
      editPageUrl: 'two',
      redirectAnchor: 'anchor-one',
    },
  }

  it('should build options from provided mappings', () => {
    const expected: AddIdentityNumberOption[] = [
      {
        id: 'one',
        label: 'First identifier',
        description: 'first identifier',
        selected: false,
      },
      {
        id: 'two',
        label: 'Second identifier',
        description: 'second identifier',
        hint: 'Also contains letters',
        selected: false,
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
        offenderId: 1,
        offenderIdSeq: 1,
      },
      {
        type: 'THREE',
        value: '999',
        offenderId: 1,
        offenderIdSeq: 2,
      },
    ]

    const expected: AddIdentityNumberOption[] = [
      {
        id: 'one',
        label: 'First identifier',
        description: 'first identifier',
        selected: false,
        mostRecentExistingValue: '123',
      },
      {
        id: 'two',
        label: 'Second identifier',
        description: 'second identifier',
        hint: 'Also contains letters',
        selected: false,
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
        description: 'first identifier',
        selected: true,
        value: '123',
        comment: 'Comment one',
      },
      {
        id: 'two',
        label: 'Second identifier',
        description: 'second identifier',
        hint: 'Also contains letters',
        selected: false,
      },
    ]

    const result = buildIdentityNumberOptions(formValues, [], mappings)

    expect(result).toEqual(expected)
  })
})
