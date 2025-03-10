import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import {
  mockOsPlacesAddressQueryResponse,
  mockOsPlacesAddressQueryEmptyResponse,
  mockOsPlacesInvalidPostcodeResponse,
  mockOsPlacesApiUnavailable,
} from '../../server/data/localMockData/osPlacesAddressQueryResponse'

const stubFindAddressesByFreeTextSearch = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/search/places/v1/find\\?query=1%2CA123BC&key=',
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
      urlPattern: '/search/places/v1/find\\?query=invalid&key=',
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
      urlPattern: '/search/places/v1/find\\?query=error&key=',
    },
    response: {
      status: 500,
      jsonBody: mockOsPlacesApiUnavailable,
    },
  })

const stubFindAddressesByPostcode = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/search/places/v1/postcode\\?postcode=A123BC&key=',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: mockOsPlacesAddressQueryResponse,
    },
  })

const stubFindAddressesByPostcodeNoResults = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/search/places/v1/postcode\\?postcode=A12&key=',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: mockOsPlacesAddressQueryEmptyResponse,
    },
  })

const stubFindAddressesByPostcodeBadRequest = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/search/places/v1/postcode\\?postcode=invalid&key=',
    },
    response: {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: mockOsPlacesInvalidPostcodeResponse,
    },
  })

const stubFindAddressesByPostcodeError = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/search/places/v1/postcode\\?postcode=error&key=',
    },
    response: {
      status: 500,
      jsonBody: mockOsPlacesApiUnavailable,
    },
  })

export default {
  stubFindAddressesByPostcodeError,
  stubFindAddressesByPostcode,
  stubFindAddressesByPostcodeBadRequest,
  stubFindAddressesByPostcodeNoResults,
  stubFindAddressesByFreeTextSearchError,
  stubFindAddressesByFreeTextSearchNoMatch,
  stubFindAddressesByFreeTextSearch,
}
