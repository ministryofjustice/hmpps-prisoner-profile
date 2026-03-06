import type { SelectOption } from '../../interfaces/GovOptions'
import ReferenceCode from '../interfaces/prisonApi/ReferenceCode'

export const appointmentTypesMock: ReferenceCode[] = [
  {
    code: 'ACTI',
    description: 'Activities',
    activeFlag: 'Y',
    systemDataFlag: 'Y',
    subCodes: [],
  },
  {
    code: 'OIC',
    description: 'Adjudication Review',
    activeFlag: 'Y',
    systemDataFlag: 'Y',
    subCodes: [],
  },
  {
    code: 'VLB',
    description: 'Video Link Booking',
    activeFlag: 'Y',
    systemDataFlag: 'Y',
    subCodes: [],
  },
]

export const appointmentTypesSelectOptionsMock: SelectOption[] = [
  {
    value: 'ACTI',
    text: 'Activities',
  },
  {
    value: 'OIC',
    text: 'Adjudication Review',
  },
  {
    value: 'VLB',
    text: 'Video Link Booking',
  },
]
