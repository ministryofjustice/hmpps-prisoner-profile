import { OsAddress } from '@ministryofjustice/hmpps-connect-dps-shared-items'

export const mockOsAddresses: OsAddress[] = [
  {
    addressString: '2 The Road, My Town, A123BC',
    buildingNumber: 2,
    buildingName: '',
    subBuildingName: '',
    thoroughfareName: 'The Road',
    dependentLocality: 'My Town',
    postTown: 'My Post Town',
    county: 'My County',
    postcode: 'A123BC',
    country: 'E',
    uprn: 12345,
  },
  {
    addressString: '1 The Road, My Town, A123BC',
    buildingNumber: 1,
    buildingName: '',
    subBuildingName: '',
    thoroughfareName: 'The Road',
    dependentLocality: 'My Town',
    postTown: 'My Post Town',
    county: 'My County',
    postcode: 'A123BC',
    country: 'E',
    uprn: 12346,
  },
]

export default { mockOsAddresses }
