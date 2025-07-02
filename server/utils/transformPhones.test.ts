import { transformPhones } from './transformPhones'
import { ReferenceDataCode } from '../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'

const exampleContact = {
  contactId: 123,
  contactType: 'HOME',
  contactValue: '012345678',
  contactPhoneExtension: '567',
}

describe('transformPhones', () => {
  it('Populates the typeDescription using phoneTypes list', () => {
    const result = transformPhones([exampleContact], [{ code: 'HOME', description: 'Home' }] as ReferenceDataCode[])

    expect(result).toEqual([
      {
        id: 123,
        type: 'HOME',
        typeDescription: 'Home',
        number: '012345678',
        extension: '567',
      },
    ])
  })

  it('Filters out email type', () => {
    const result = transformPhones([{ ...exampleContact, contactType: 'EMAIL' }], [
      { code: 'EMAIL', description: 'Email' },
    ] as ReferenceDataCode[])

    expect(result).toEqual([])
  })

  it('Handles type not present in phoneTypes list', () => {
    const result = transformPhones([exampleContact], [])
    expect(result).toEqual([
      {
        id: 123,
        type: 'HOME',
        typeDescription: undefined,
        number: '012345678',
        extension: '567',
      },
    ])
  })

  it('Handles null phoneTypes list', () => {
    const result = transformPhones([exampleContact], null)
    expect(result).toEqual([
      {
        id: 123,
        type: 'HOME',
        typeDescription: undefined,
        number: '012345678',
        extension: '567',
      },
    ])
  })
})
