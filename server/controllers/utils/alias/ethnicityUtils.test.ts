import { ReferenceDataCodeDto } from '../../../data/interfaces/referenceData'
import { getEthnicBackgroundRadioOptions, getEthnicityGroupRadioOptions } from './ethnicityUtils'
import { RadioOption } from '../../../utils/utils'

describe('ethnicityUtils', () => {
  describe('Get ethnicity group radio options', () => {
    it('Returns empty when no matching active reference codes', () => {
      expect(getEthnicityGroupRadioOptions([])).toEqual([])
    })

    it('Returns all ethnicity group options when all codes match active reference codes', () => {
      expect(getEthnicityGroupRadioOptions(allActiveEthnicityReferenceCodes())).toEqual([
        { value: 'white', text: 'White' },
        { value: 'mixed', text: 'Mixed or multiple ethnic groups' },
        { value: 'asian', text: 'Asian or Asian British' },
        { value: 'black', text: 'Black, Black British, Caribbean or African' },
        { value: 'other', text: 'Other ethnic group' },
        { divider: 'or' },
        { value: 'NS', text: 'They prefer not to say', checked: false },
      ])
    })

    it('Returns an ethnicity group option when one or more code is active', () => {
      expect(getEthnicityGroupRadioOptions([])).toEqual([])
      expect(getEthnicityGroupRadioOptions([referenceCode('W1')])).toEqual([{ value: 'white', text: 'White' }])
      expect(getEthnicityGroupRadioOptions([referenceCode('W1'), referenceCode('W2')])).toEqual([
        { value: 'white', text: 'White' },
      ])
    })

    it('Only matches active reference codes', () => {
      expect(getEthnicityGroupRadioOptions([referenceCode('W1', false), referenceCode('O2', true)])).toEqual([
        { value: 'other', text: 'Other ethnic group' },
      ])
    })

    it('Handles unknown reference codes', () => {
      expect(getEthnicityGroupRadioOptions([referenceCode('??')])).toEqual([])
      expect(getEthnicityGroupRadioOptions([referenceCode('W123')])).toEqual([])
    })

    it('Sets on option to checked when passing in a selected code', () => {
      expect(getEthnicityGroupRadioOptions(allActiveEthnicityReferenceCodes(), 'W1')).toEqual([
        { value: 'white', text: 'White', checked: true },
        { value: 'mixed', text: 'Mixed or multiple ethnic groups' },
        { value: 'asian', text: 'Asian or Asian British' },
        { value: 'black', text: 'Black, Black British, Caribbean or African' },
        { value: 'other', text: 'Other ethnic group' },
        { divider: 'or' },
        { value: 'NS', text: 'They prefer not to say', checked: false },
      ])
    })
  })

  describe('Get ethnic background radio options', () => {
    it('Returns empty when no matching active reference codes', () => {
      expect(getEthnicBackgroundRadioOptions('?', [])).toEqual([])
      expect(getEthnicBackgroundRadioOptions('?', [referenceCode('OTHER')])).toEqual([])
      expect(getEthnicBackgroundRadioOptions('?', [referenceCode('W1')])).toEqual([])
      expect(getEthnicBackgroundRadioOptions('white', [referenceCode('?')])).toEqual([])
    })

    it.each([
      [
        'white',
        [
          { value: 'W1', text: 'English, Welsh, Scottish, Northern Irish or British' },
          { value: 'W2', text: 'Irish' },
          { value: 'W3', text: 'Gypsy or Irish Traveller' },
          { value: 'W10', text: 'Roma' },
          { value: 'W9', text: 'Any other White background' },
        ],
      ],
      [
        'mixed',
        [
          { value: 'M1', text: 'White and Black Caribbean' },
          { value: 'M2', text: 'White and Black African' },
          { value: 'M3', text: 'White and Asian' },
          { value: 'M9', text: 'Any other mixed or multiple ethnic background' },
        ],
      ],
      [
        'asian',
        [
          { value: 'A1', text: 'Indian' },
          { value: 'A2', text: 'Pakistani' },
          { value: 'A3', text: 'Bangladeshi' },
          { value: 'A4', text: 'Chinese' },
          { value: 'A9', text: 'Any other Asian background' },
        ],
      ],
      [
        'black',
        [
          { value: 'B2', text: 'African' },
          { value: 'B1', text: 'Caribbean' },
          { value: 'B9', text: 'Any other Black, African or Caribbean background' },
        ],
      ],
      [
        'other',
        [
          { value: 'O2', text: 'Arab' },
          { value: 'O9', text: 'Any other ethnic group' },
        ],
      ],
    ])(
      'Ethnic group %s returns expected options when all codes match active reference codes',
      (group: string, expectedRadioOptions: RadioOption[]) => {
        expect(getEthnicBackgroundRadioOptions(group, allActiveEthnicityReferenceCodes())).toEqual(expectedRadioOptions)
      },
    )
  })

  it('Only matches active reference codes', () => {
    expect(getEthnicBackgroundRadioOptions('white', [referenceCode('W1', false), referenceCode('W2', true)])).toEqual([
      { value: 'W2', text: 'Irish' },
    ])
  })

  it('Handles unknown reference codes', () => {
    expect(getEthnicBackgroundRadioOptions('white', [referenceCode('??')])).toEqual([])
    expect(getEthnicBackgroundRadioOptions('white', [referenceCode('W123')])).toEqual([])
  })

  it('Sets on option to checked when passing in a selected code', () => {
    expect(getEthnicBackgroundRadioOptions('black', allActiveEthnicityReferenceCodes(), 'B2')).toEqual([
      { value: 'B2', text: 'African', checked: true },
      { value: 'B1', text: 'Caribbean' },
      { value: 'B9', text: 'Any other Black, African or Caribbean background' },
    ])
  })
})

function referenceCode(code: string, isActive = true) {
  return { code, isActive } as ReferenceDataCodeDto
}

function allActiveEthnicityReferenceCodes() {
  return [
    'A1',
    'A2',
    'A3',
    'A4',
    'A9',
    'B1',
    'B2',
    'B9',
    'M1',
    'M2',
    'M3',
    'M9',
    'MERGE',
    'NS',
    'O2',
    'O9',
    'W1',
    'W2',
    'W3',
    'W9',
    'W10',
  ].map(code => referenceCode(code))
}
