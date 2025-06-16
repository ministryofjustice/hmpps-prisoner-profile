import { AddressRequestDto, AddressResponseDto } from '../../interfaces/personIntegrationApi/personIntegrationApiClient'
import { PrisonerMockDataA } from '../prisoner'

export const mockAddressRequestDto: AddressRequestDto = {
  uprn: 321,
  noFixedAbode: false,
  subBuildingName: 'Flat 1',
  buildingName: 'The Flats',
  buildingNumber: '1',
  thoroughfareName: 'The Road',
  dependantLocality: 'The Area',
  postTownCode: 'SHEF',
  countyCode: 'SY',
  countryCode: 'ENG',
  postCode: 'A1 2BC',
  fromDate: '2024-06-16',
  toDate: '2025-06-16',
  addressTypes: [],
  postalAddress: true,
  primaryAddress: true,
}

export const mockAddressResponseDto: AddressResponseDto = {
  addressId: 123,
  personId: PrisonerMockDataA.prisonerNumber,
  uprn: 321,
  noFixedAbode: false,
  subBuildingName: 'Flat 1',
  buildingName: 'The Flats',
  buildingNumber: '1',
  thoroughfareName: 'The Road',
  dependantLocality: 'The Area',
  postTown: {
    id: 'CITY_SHEF',
    code: 'SHEF',
    description: 'Sheffield',
  },
  county: {
    id: 'COUNTY_SY',
    code: 'SY',
    description: 'South Yorkshire',
  },
  country: {
    id: 'COUNTRY_ENG',
    code: 'ENG',
    description: 'England',
  },
  postCode: 'A1 2BC',
  fromDate: '2024-06-16',
  toDate: '2025-06-16',
  addressTypes: [],
  postalAddress: true,
  primaryAddress: true,
}
