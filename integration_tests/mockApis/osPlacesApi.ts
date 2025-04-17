import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import {
  mockOsPlacesAddressQueryResponse,
  mockOsPlacesAddressQueryEmptyResponse,
  mockOsPlacesApiUnavailable,
} from '../../server/data/localMockData/osPlacesAddressQueryResponse'

const stubFindAddressesByFreeTextSearch = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/osPlaces/search/places/v1/find\\?query=1%2CA123BC&key=',
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
      urlPattern: '/osPlaces/search/places/v1/find\\?query=invalid&key=',
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
      urlPattern: '/osPlaces/search/places/v1/find\\?query=error&key=',
    },
    response: {
      status: 500,
      jsonBody: mockOsPlacesApiUnavailable,
    },
  })

export default {
  stubFindAddressesByFreeTextSearchError,
  stubFindAddressesByFreeTextSearchNoMatch,
  stubFindAddressesByFreeTextSearch,
}
