import { ReferenceDataCodeDto } from '../../../data/interfaces/referenceData'
import { objectToRadioOptions, RadioOption } from '../../../utils/utils'

export function getEthnicGroupRadioOptions(
  ethnicityReferenceCodes: ReferenceDataCodeDto[],
  selectedEthnicityCode: string = null,
): (RadioOption | { divider: string })[] {
  const allowPreferNotToSay = isActive('NS', ethnicityReferenceCodes)

  const activeEthnicGroups = ethnicGroups.filter(group =>
    group.backgrounds.some(background => isActive(background.code, ethnicityReferenceCodes)),
  )

  const checkedGroup = ethnicGroups.find(group =>
    group.backgrounds.map(background => background.code).includes(selectedEthnicityCode),
  )?.group

  return [
    ...objectToRadioOptions(activeEthnicGroups, 'group', 'description', checkedGroup),
    ...(allowPreferNotToSay ? [{ divider: 'or' }] : []),
    ...(allowPreferNotToSay
      ? [
          {
            value: 'NS',
            text: 'They prefer not to say',
            checked: selectedEthnicityCode === 'NS',
          },
        ]
      : []),
  ]
}

export function getEthnicBackgroundRadioOptions(
  ethnicGroup: string,
  ethnicityReferenceCodes: ReferenceDataCodeDto[],
  selectedEthnicityCode: string = null,
): RadioOption[] {
  const activeEthnicBackgrounds =
    findEthnicGroup(ethnicGroup)?.backgrounds?.filter(background =>
      isActive(background.code, ethnicityReferenceCodes),
    ) || []

  return objectToRadioOptions(activeEthnicBackgrounds, 'code', 'description', selectedEthnicityCode)
}

export function getEthnicGroupDescription(ethnicGroup: string): string {
  return ethnicGroups.find(group => group.group === ethnicGroup)?.description
}

export function getEthnicGroupDescriptionForHeading(ethnicGroup: string): string {
  return ethnicGroups.find(group => group.group === ethnicGroup)?.headingDescription
}

function findEthnicGroup(ethnicGroup: string): EthnicGroup {
  return ethnicGroups.find(group => group.group === ethnicGroup)
}

function isActive(background: string, ethnicityReferenceCodes: ReferenceDataCodeDto[]) {
  return ethnicityReferenceCodes
    .filter(code => code.isActive)
    .map(code => code.code)
    .includes(background)
}

interface EthnicBackground {
  code: string
  description: string
}

interface EthnicGroup {
  group: string
  description: string
  headingDescription: string
  backgrounds: EthnicBackground[]
}

const ethnicGroups: EthnicGroup[] = [
  {
    group: 'white',
    description: 'White',
    headingDescription: 'White',
    backgrounds: [
      { code: 'W1', description: 'English, Welsh, Scottish, Northern Irish or British' },
      { code: 'W2', description: 'Irish' },
      { code: 'W3', description: 'Gypsy or Irish Traveller' },
      { code: 'W10', description: 'Roma' },
      { code: 'W9', description: 'Any other White background' },
    ],
  },
  {
    group: 'mixed',
    description: 'Mixed or multiple ethnic groups',
    headingDescription: 'mixed or multiple ethnic groups',
    backgrounds: [
      { code: 'M1', description: 'White and Black Caribbean' },
      { code: 'M2', description: 'White and Black African' },
      { code: 'M3', description: 'White and Asian' },
      { code: 'M9', description: 'Any other mixed or multiple ethnic background' },
    ],
  },
  {
    group: 'asian',
    description: 'Asian or Asian British',
    headingDescription: 'Asian or Asian British',
    backgrounds: [
      { code: 'A1', description: 'Indian' },
      { code: 'A2', description: 'Pakistani' },
      { code: 'A3', description: 'Bangladeshi' },
      { code: 'A4', description: 'Chinese' },
      { code: 'A9', description: 'Any other Asian background' },
    ],
  },
  {
    group: 'black',
    description: 'Black, Black British, Caribbean or African',
    headingDescription: 'Black, Black British, Caribbean or African',
    backgrounds: [
      { code: 'B2', description: 'African' },
      { code: 'B1', description: 'Caribbean' },
      { code: 'B9', description: 'Any other Black, African or Caribbean background' },
    ],
  },
  {
    group: 'other',
    description: 'Other ethnic group',
    headingDescription: '',
    backgrounds: [
      { code: 'O2', description: 'Arab' },
      { code: 'O9', description: 'Any other ethnic group' },
    ],
  },
]
