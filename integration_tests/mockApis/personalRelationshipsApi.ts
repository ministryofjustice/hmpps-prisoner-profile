import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import {
  PersonalRelationshipsContactsDto,
  PersonalRelationshipsNumberOfChildrenDto,
  PersonalRelationshipType,
} from '../../server/data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

const baseUrl = '/personalRelationships'

const stubPersonalRelationshipsCount = (params: {
  prisonerNumber: string
  relationshipType: PersonalRelationshipType
}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/contact/count`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { official: 2, social: 1 },
    },
  })

const stubPersonalRelationshipsCountError = (params: { prisonerNumber: string }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/contact/count`,
    },
    response: {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        error: 'Something went wrong',
      },
    },
  })

const stubPersonalRelationshipsContacts = (params: {
  prisonerNumber: string
  resp: PersonalRelationshipsContactsDto
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/contact\\?.*`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: params.resp,
    },
  })

const stubPersonalRelationshipsGetNumberOfChildren = (params: {
  prisonerNumber: string
  resp: PersonalRelationshipsNumberOfChildrenDto
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/number-of-children`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: params.resp,
    },
  })

const stubPersonalRelationshipsUpdateNumberOfChildren = (params: {
  prisonerNumber: string
  resp: PersonalRelationshipsNumberOfChildrenDto
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/number-of-children`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: params.resp,
    },
  })

export default {
  stubPersonalRelationshipsCount,
  stubPersonalRelationshipsCountError,
  stubPersonalRelationshipsContacts,
  stubPersonalRelationshipsGetNumberOfChildren,
  stubPersonalRelationshipsUpdateNumberOfChildren,
}
