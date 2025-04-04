import Interface from './Interface'
import ContactsService from '../../server/services/contactsService'

export const contactsServiceMock = (): Interface<ContactsService> => ({
  getContactsCount: jest.fn(),
})
