import { ContactsResponseDto } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ReferenceDataCodeDto } from '../data/interfaces/referenceData'
import { PhoneNumber } from '../services/interfaces/personalPageService/PersonalPage'

export function transformPhones(contacts: ContactsResponseDto[], phoneTypes: ReferenceDataCodeDto[]): PhoneNumber[] {
  return contacts
    .filter(c => c.contactType !== 'EMAIL')
    .map(c => ({
      id: c.contactId,
      type: c.contactType,
      typeDescription: phoneTypes?.find(t => t.code === c.contactType)?.description,
      extension: c.contactPhoneExtension,
      number: c.contactValue,
    }))
}
