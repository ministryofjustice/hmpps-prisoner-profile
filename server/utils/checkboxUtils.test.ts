import {
  checkboxFieldDataToInputs,
  checkboxInputToSelectedValues,
  referenceDataDomainToCheckboxFieldDataOptions,
  referenceDataDomainToCheckboxOptions,
} from './checkboxUtils'
import { CheckboxOptions } from './utils'
import { ReferenceDataCode, ReferenceDataDomain } from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'

describe('Checkbox Utils', () => {
  describe('CheckboxInputToSelectedValues', () => {
    it.each([
      ['empty', { fieldName: 'example', input: null, expected: [] }],
      ['single selected item', { fieldName: 'example', input: { example: ['SELECTED'] }, expected: ['SELECTED'] }],
      [
        'multiple selected items',
        { fieldName: 'example', input: { example: ['SELECTED', 'ANOTHER'] }, expected: ['SELECTED', 'ANOTHER'] },
      ],
      [
        'selected item with selected subvalues',
        {
          fieldName: 'example',
          input: { example: ['SELECTED'], 'SELECTED-subvalues': ['SELECTED__SUBVALUE'] },
          expected: ['SELECTED', 'SELECTED__SUBVALUE'],
        },
      ],
      [
        'selected item with leftover subvalues',
        {
          fieldName: 'example',
          input: { example: ['SELECTED'], 'LEFTOVER-subvalues': ['SELECTED__SUBVALUE'] },
          expected: ['SELECTED'],
        },
      ],
      [
        'no without other options',
        {
          fieldName: 'example',
          input: { example: ['EXAMPLE_NO'] },
          expected: ['EXAMPLE_NO'],
        },
      ],
      [
        'no with other options',
        { fieldName: 'example', input: { example: ['EXAMPLE_NO', 'OTHER_SELECTED'] }, expected: ['EXAMPLE_NO'] },
      ],
      [
        'dont no without other options',
        { fieldName: 'example', input: { example: ['EXAMPLE_DONT_KNOW'] }, expected: ['EXAMPLE_DONT_KNOW'] },
      ],
      [
        'dont no with other options',
        {
          fieldName: 'example',
          input: { example: ['EXAMPLE_DONT_KNOW', 'OTHER_SELECTED'] },
          expected: ['EXAMPLE_DONT_KNOW'],
        },
      ],
    ])('%s', (_, { fieldName, input, expected }) => {
      expect(checkboxInputToSelectedValues(fieldName, input)).toEqual(expected)
    })
  })

  describe('CheckboxFieldDataToInputs', () => {
    it('Maps inputs without subvalues or checked values', () => {
      const input: CheckboxOptions[] = [
        { value: 'EXAMPLE', text: 'Example' },
        { value: 'TWO', text: 'Two' },
      ]

      expect(checkboxFieldDataToInputs(input)).toEqual([
        { value: 'EXAMPLE', text: 'Example', checked: false },
        { value: 'TWO', text: 'Two', checked: false },
      ])
    })

    it('Maps inputs without subvalues with checked values', () => {
      const input: CheckboxOptions[] = [
        { value: 'EXAMPLE', text: 'Example' },
        { value: 'TWO', text: 'Two' },
      ]

      expect(checkboxFieldDataToInputs(input, ['TWO'])).toEqual([
        { value: 'EXAMPLE', text: 'Example', checked: false },
        { value: 'TWO', text: 'Two', checked: true },
      ])
    })

    it('Maps inputs with subvalues without checked values', () => {
      const input: CheckboxOptions[] = [
        {
          value: 'EXAMPLE',
          text: 'Example',
          subValues: {
            hint: 'hint',
            title: 'subvalues',
            options: [{ text: 'Subvalue', value: 'SUBVALUE' }],
          },
        },
        { value: 'TWO', text: 'Two' },
      ]

      expect(checkboxFieldDataToInputs(input)).toEqual([
        {
          value: 'EXAMPLE',
          text: 'Example',
          checked: false,
          subValues: {
            title: 'subvalues',
            hint: 'hint',
            items: [{ value: 'SUBVALUE', text: 'Subvalue', checked: false }],
          },
        },
        {
          value: 'TWO',
          text: 'Two',
          checked: false,
        },
      ])
    })

    it('Maps inputs with subvalues with checked subvalues', () => {
      const input: CheckboxOptions[] = [
        {
          value: 'EXAMPLE',
          text: 'Example',
          subValues: {
            hint: 'hint',
            title: 'subvalues',
            options: [
              { text: 'Subvalue', value: 'SUBVALUE' },
              { text: 'Subvalue 2', value: 'SUBVALUE_TWO' },
            ],
          },
        },
        { value: 'TWO', text: 'Two' },
      ]

      expect(checkboxFieldDataToInputs(input, ['SUBVALUE'])).toEqual([
        {
          value: 'EXAMPLE',
          text: 'Example',
          checked: false,
          subValues: {
            title: 'subvalues',
            hint: 'hint',
            items: [
              { value: 'SUBVALUE', text: 'Subvalue', checked: true },
              { value: 'SUBVALUE_TWO', text: 'Subvalue 2', checked: false },
            ],
          },
        },
        {
          value: 'TWO',
          text: 'Two',
          checked: false,
        },
      ])
    })
  })

  describe('referenceDataDomainToCheckboxOptions', () => {
    it('Removes no/dont know from the options', () => {
      const input: ReferenceDataDomain = {
        code: 'EXAMPLE',
        subDomains: [],
        description: '',
        createdBy: '',
        isActive: true,
        createdAt: '',
        listSequence: 0,
        referenceDataCodes: ['NO', 'EXAMPLE', 'DONT_KNOW'].map(id => ({
          id: `EXAMPLE_${id}`,
          code: 'code',
          domain: 'EXAMPLE',
          isActive: true,
          createdAt: '',
          listSequence: 0,
          createdBy: '',
          description: '',
        })),
      }

      const actual = referenceDataDomainToCheckboxOptions(input)
      expect(actual.length).toEqual(1)
      expect(actual[0].value).toEqual('EXAMPLE_EXAMPLE')
    })
  })

  describe('referenceDataDomainToCheckboxFieldDataOptions', () => {
    it.each([
      [
        [
          { id: 'EXAMPLE_EXAMPLE', isActive: true },
          { id: 'EXAMPLE_NO', isActive: true },
        ],
        true,
      ],
      [
        [
          { id: 'EXAMPLE_EXAMPLE', isActive: true },
          { id: 'EXAMPLE_NO', isActive: false },
        ],
        false,
      ],
      [[{ id: 'EXAMPLE_EXAMPLE', isActive: true }], false],
    ])('Show no: %j (%s)', (referenceDataIds: Partial<ReferenceDataCode>[], expectedValue) => {
      const input: ReferenceDataDomain = {
        code: 'EXAMPLE',
        subDomains: [],
        description: '',
        createdBy: '',
        isActive: true,
        createdAt: '',
        listSequence: 0,
        referenceDataCodes: referenceDataIds.map(({ id, isActive }) => ({
          id,
          code: 'code',
          domain: 'EXAMPLE',
          isActive,
          createdAt: '',
          listSequence: 0,
          createdBy: '',
          description: '',
        })),
      }

      expect(referenceDataDomainToCheckboxFieldDataOptions(input).showNo).toEqual(expectedValue)
    })

    it.each([
      [
        [
          { id: 'EXAMPLE_EXAMPLE', isActive: true },
          { id: 'EXAMPLE_DONT_KNOW', isActive: true },
        ],
        true,
      ],
      [
        [
          { id: 'EXAMPLE_EXAMPLE', isActive: true },
          { id: 'EXAMPLE_DONT_KNOW', isActive: false },
        ],
        false,
      ],
      [[{ id: 'EXAMPLE_EXAMPLE', isActive: true }], false],
    ])('Show dont know: %j (%s)', (referenceDataIds: Partial<ReferenceDataCode>[], expectedValue) => {
      const input: ReferenceDataDomain = {
        code: 'EXAMPLE',
        subDomains: [],
        description: '',
        createdBy: '',
        isActive: true,
        createdAt: '',
        listSequence: 0,
        referenceDataCodes: referenceDataIds.map(({ id, isActive }) => ({
          id,
          code: 'code',
          domain: 'EXAMPLE',
          isActive,
          createdAt: '',
          listSequence: 0,
          createdBy: '',
          description: '',
        })),
      }

      expect(referenceDataDomainToCheckboxFieldDataOptions(input).showDontKnow).toEqual(expectedValue)
    })
  })
})
