import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import {
  mockOsPlacesAddressQueryEmptyResponse,
  mockOsPlacesAddressQueryResponse,
  mockOsPlacesAddressQuerySingleResponse,
  mockOsPlacesApiUnavailable,
} from '../../server/data/localMockData/osPlacesAddressQueryResponse'

const findQueryParams = '&key=&lr=EN&fq=LOGICAL_STATUS_CODE%3A1&fq=LPI_LOGICAL_STATUS_CODE%3A1&dataset=LPI'
const uprnQueryParams = '&key=&dataset=DPA%2CLPI'

const stubFindAddressesByFreeTextSearch = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/osPlaces/search/places/v1/find\\?query=.*${findQueryParams}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: mockOsPlacesAddressQueryResponse,
    },
  })

const stubFindAddressesByFreeTextSearchNoMatch = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/osPlaces/search/places/v1/find\\?query=invalid${findQueryParams}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: mockOsPlacesAddressQueryEmptyResponse,
    },
  })

const stubFindAddressesByFreeTextSearchError = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/osPlaces/search/places/v1/find\\?query=error${findQueryParams}`,
    },
    response: {
      status: 500,
      jsonBody: mockOsPlacesApiUnavailable,
    },
  })

const stubFindAddressesByUprn = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/osPlaces/search/places/v1/uprn\\?uprn=.*${uprnQueryParams}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: mockOsPlacesAddressQuerySingleResponse,
    },
  })

export default {
  stubFindAddressesByFreeTextSearchError,
  stubFindAddressesByFreeTextSearchNoMatch,
  stubFindAddressesByFreeTextSearch,
  stubFindAddressesByUprn,
}
