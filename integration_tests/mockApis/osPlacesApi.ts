import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import {
  mockOsPlacesAddressQueryEmptyResponse,
  mockOsPlacesAddressQueryResponse,
  mockOsPlacesAddressQuerySingleResponse,
  mockOsPlacesApiUnavailable,
} from '../../server/data/localMockData/osPlacesAddressQueryResponse'

const stubFindAddressesByFreeTextSearch = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/osPlaces/search/places/v1/find\\?query=.*&lr=EN&key=`,
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
      urlPattern: '/osPlaces/search/places/v1/find\\?query=invalid&lr=EN&key=',
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
      urlPattern: '/osPlaces/search/places/v1/find\\?query=error&lr=EN&key=',
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
      urlPattern: `/osPlaces/search/places/v1/uprn\\?uprn=.*&key=`,
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
