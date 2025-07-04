import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import {
  PersonalRelationshipsContactCreationResultDto,
  PersonalRelationshipsContactsDto,
  PersonalRelationshipsDomesticStatusDto,
  PersonalRelationshipsNumberOfChildrenDto,
  PersonalRelationshipsReferenceCode,
  PersonalRelationshipsReferenceDataDomain,
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
  error: boolean
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/contact\\?.*`,
    },
    response: {
      status: params.error ? 500 : 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: params.error
        ? {
            errorMessage: 'Service unavailable',
            httpStatusCode: 500,
          }
        : params.resp,
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

const stubPersonalRelationshipsGetDomesticStatus = (params: {
  prisonerNumber: string
  resp: PersonalRelationshipsDomesticStatusDto
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/domestic-status`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: params.resp,
    },
  })

const stubPersonalRelationshipsUpdateDomesticStatus = (params: {
  prisonerNumber: string
  resp: PersonalRelationshipsDomesticStatusDto
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/domestic-status`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: params.resp,
    },
  })

const stubPersonalRelationshipsGetReferenceData = (params: {
  domain: PersonalRelationshipsReferenceDataDomain
  referenceData: PersonalRelationshipsReferenceCode[]
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `${baseUrl}/reference-codes/group/${params.domain}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: params.referenceData,
    },
  })

const stubPersonalRelationshipsCreateContact = (params: {
  resp: PersonalRelationshipsContactCreationResultDto
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPathPattern: `${baseUrl}/contact`,
    },
    response: {
      status: 201,
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
  stubPersonalRelationshipsGetDomesticStatus,
  stubPersonalRelationshipsUpdateDomesticStatus,
  stubPersonalRelationshipsGetReferenceData,
  stubPersonalRelationshipsCreateContact,
}
