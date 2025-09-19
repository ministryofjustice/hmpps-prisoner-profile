import SecondaryLanguage from '../interfaces/prisonApi/SecondaryLanguage'

export const secondaryLanguagesMock: SecondaryLanguage[] = [
  {
    bookingId: 1102484,
    code: 'AZE',
    description: 'Azerbaijani',
    canRead: false,
    canWrite: false,
    canSpeak: false,
  },
  {
    bookingId: 1102484,
    code: 'BSL',
    description: 'British Sign Language',
    canRead: true,
    canWrite: false,
    canSpeak: true,
  },
  {
    bookingId: 1102484,
    code: 'GLA',
    description: 'Gaelic; Scottish Gaelic',
    canRead: false,
    canWrite: true,
    canSpeak: true,
  },
  {
    bookingId: 1102484,
    code: 'MAN',
    description: 'Mandarin',
    canRead: true,
    canWrite: true,
    canSpeak: true,
  },
  {
    bookingId: 1102484,
    code: 'URD',
    description: 'Urdu',
    canRead: true,
    canWrite: false,
    canSpeak: false,
  },
]

export default { secondaryLanguagesMock }
