import { AgencyDetails } from '../../interfaces/prisonApi/agencies'

const AgenciesMock: AgencyDetails = {
  agencyId: 'MDI',
  description: 'Moorland (HMP & YOI)',
  longDescription: 'Moorland (HMP & YOI)',
  agencyType: 'INST',
  active: true,
  courtType: 'CC',
  deactivationDate: '2012-01-12',
  addresses: [
    {
      addressId: 543524,
      addressType: 'BUS',
      flat: '3B',
      premise: 'Liverpool Prison',
      street: 'Slinn Street',
      locality: 'Brincliffe',
      town: 'Liverpool',
      postalCode: 'LI1 5TH',
      county: 'HEREFORD',
      country: 'ENG',
      comment: 'This is a comment text',
      primary: false,
      noFixedAddress: false,
      startDate: '2005-05-12',
      endDate: '2021-02-12',
      phones: [
        {
          phoneId: 2234232,
          number: '0114 2345678',
          type: 'TEL',
          ext: '123',
        },
      ],
      addressUsages: [
        {
          addressId: 23422313,
          addressUsage: 'HDC',
          addressUsageDescription: 'HDC Address',
          activeFlag: true,
        },
      ],
    },
  ],
  phones: [
    {
      phoneId: 2234232,
      number: '0114 2345678',
      type: 'TEL',
      ext: '123',
    },
  ],
  emails: [
    {
      email: 'string',
    },
  ],
}
export default AgenciesMock
