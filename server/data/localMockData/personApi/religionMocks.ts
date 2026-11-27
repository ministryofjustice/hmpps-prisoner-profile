import type { PersonApiReferenceDataCode, ReligionHistoryItem } from '../../interfaces/personApi'

export const personApiReligionCodesMock: PersonApiReferenceDataCode[] = [
  { code: 'BUDD', description: 'Buddhist', active: true },
  { code: 'COFE', description: 'Christian - Anglican (incl. CofE & CinW)', active: true },
  { code: 'CHRST', description: 'Christian - Other', active: true },
  { code: 'OORTH', description: 'Christian - Oriental Orthodox', active: true },
  { code: 'CHRODX', description: 'Christian - Orthodox', active: true },
  { code: 'METH', description: 'Christian - Methodist', active: true },
  { code: 'ZORO', description: 'Zoroastrian', active: true },
  { code: 'SUNI', description: 'Muslim - Sunni', active: true },
  { code: 'MUSOTH', description: 'Muslim - Other', active: true },
  { code: 'SHIA', description: 'Muslim - Shia', active: true },
  { code: 'MOS', description: 'Muslim', active: true },
  { code: 'OTH', description: 'Other', active: true },
  { code: 'NIL', description: 'No religion', active: true },
  { code: 'TPRNTS', description: 'They prefer not to say', active: true },
]

export const mockReligionHistory: ReligionHistoryItem[] = [
  {
    current: true,
    religionCode: 'TPRNTS',
    religionDescription: 'They prefer not to say',
    changeReasonKnown: true,
    comments: 'They do not want others to know',
    startDate: '2026-10-28',
    endDate: null,
    createUserId: 'jlpic',
    createDateTime: '2026-10-28T14:30:00',
    modifyUserId: null,
    modifyDateTime: null,
  },
  {
    current: false,
    religionCode: 'CCOG',
    religionDescription: 'Celestial Church of God',
    changeReasonKnown: false,
    comments: null,
    startDate: '2022-01-01',
    endDate: '2026-10-28',
    createUserId: 'jkirk',
    createDateTime: '2022-01-01T09:45:02',
    modifyUserId: 'jlpic',
    modifyDateTime: '2026-10-28T14:30:00',
  },
]
