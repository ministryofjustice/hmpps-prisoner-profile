import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import {
  personalRelationshipsOfficialMock,
  personalRelationshipsSocialMock,
} from '../../server/data/localMockData/personalRelationshipsApiMock'
import { PersonalRelationshipType } from '../../server/data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

const baseUrl = '/personalRelationships'

const stubPersonalRelationshipCount = (params: {
  prisonerNumber: string
  relationshipType: PersonalRelationshipType
}) =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/contact`,
      queryParameters: {
        relationshipType: {
          equalTo: params.relationshipType,
        },
        page: {
          equalTo: '0',
        },
        size: {
          equalTo: '1',
        },
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody:
        params.relationshipType === PersonalRelationshipType.Official
          ? personalRelationshipsOfficialMock
          : personalRelationshipsSocialMock,
    },
  })

const stubOfficialRelationshipsCount = (params: { prisonerNumber: string }): SuperAgentRequest =>
  stubPersonalRelationshipCount({
    prisonerNumber: params.prisonerNumber,
    relationshipType: PersonalRelationshipType.Official,
  })

const stubSocialRelationshipsCount = (params: { prisonerNumber: string }): SuperAgentRequest =>
  stubPersonalRelationshipCount({
    prisonerNumber: params.prisonerNumber,
    relationshipType: PersonalRelationshipType.Social,
  })

const stubPersonalRelationshipsCountError = (params: { prisonerNumber: string }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `${baseUrl}/prisoner/${params.prisonerNumber}/contact`,
      queryParameters: {
        relationshipType: {
          equalTo: PersonalRelationshipType.Social,
        },
        page: {
          equalTo: '0',
        },
        size: {
          equalTo: '1',
        },
      },
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

export default { stubOfficialRelationshipsCount, stubSocialRelationshipsCount, stubPersonalRelationshipsCountError }
