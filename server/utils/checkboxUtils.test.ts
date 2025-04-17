import { checkboxFieldDataToInputs, checkboxInputToSelectedValues } from './checkboxUtils'
import { CheckboxOptions } from './utils'

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
})
