import {
  GlobalEmail,
  GlobalNumbersAndEmails,
  GlobalPhoneNumber,
} from '../../services/interfaces/personalPageService/PersonalPage'

export const globalPhonesMock: GlobalPhoneNumber[] = [
  {
    id: 321,
    type: 'HOME',
    number: '09876 098 098',
  },
  {
    id: 123,
    type: 'BUS',
    number: '12345 678 901',
    extension: '123',
  },
]

export const globalEmailsMock: GlobalEmail[] = [
  {
    id: 234,
    email: 'one@example.com',
  },
  {
    id: 432,
    email: 'two@example.com',
  },
]

export const globalPhonesAndEmailsMock: GlobalNumbersAndEmails = {
  phones: globalPhonesMock,
  emails: globalEmailsMock,
}
