import { ReferenceDataCodeDto } from '../../interfaces/personIntegrationApi/personIntegrationApiClient'

export const NationalityReferenceDataCodes: ReferenceDataCodeDto[] = [
  {
    id: 'NAT_BRIT',
    code: 'BRIT',
    description: 'British',
    listSequence: 1,
    isActive: true,
  },
  {
    id: 'NAT_FREN',
    code: 'FREN',
    description: 'French',
    listSequence: 2,
    isActive: true,
  },
  {
    id: 'NAT_GERM',
    code: 'GERM',
    description: 'German',
    listSequence: 3,
    isActive: false,
  },
]
