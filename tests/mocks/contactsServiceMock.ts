import Interface from './Interface'
import ContactsService from '../../server/services/contactsService'

export const contactsServiceMock = (): Interface<ContactsService> => ({
  getExternalContactsCount: jest.fn(),
})

export default { contactsServiceMock }
