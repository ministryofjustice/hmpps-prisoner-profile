import { PrisonerProfileDeliusApiClient } from '../data/interfaces/deliusApi/prisonerProfileDeliusApiClient'
import ProbationDocumentsService from './probationDocumentsService'
import { mockProbationDocumentsResponse } from '../data/localMockData/deliusApi/probationDocuments'
import ServerError from '../utils/serverError'

describe('probationDocumentsService', () => {
  let deliusApiClient: PrisonerProfileDeliusApiClient
  let service: ProbationDocumentsService

  beforeEach(() => {
    deliusApiClient = {
      getCommunityManager: jest.fn(),
      getProbationDocuments: jest.fn(async () => mockProbationDocumentsResponse),
    }

    service = new ProbationDocumentsService(() => deliusApiClient)
  })

  describe('getCommunityDocuments', () => {
    it('Gets data from the delius API', async () => {
      await service.getDocuments('token', 'ABC')

      expect(deliusApiClient.getProbationDocuments).toHaveBeenCalledWith('ABC')
    })

    it('Formats the response', async () => {
      const response = await service.getDocuments('token', 'ABC')
      expect(response).toEqual(
        expect.objectContaining({
          status: 'fulfilled',
          value: {
            documents: {
              offenderDocuments: mockProbationDocumentsResponse.documents,
              convictions: mockProbationDocumentsResponse.convictions,
            },
            probationDetails: { name: 'first last', crn: mockProbationDocumentsResponse.crn },
          },
        }),
      )
    })

    it('Handles no documents being returned', async () => {
      deliusApiClient.getProbationDocuments = jest.fn(async () => ({
        ...mockProbationDocumentsResponse,
        documents: undefined,
      }))

      const response = await service.getDocuments('token', 'ABC')
      expect(response).toEqual(
        expect.objectContaining({
          status: 'fulfilled',
          value: {
            documents: {
              offenderDocuments: [],
              convictions: mockProbationDocumentsResponse.convictions,
            },
            probationDetails: { name: 'first last', crn: mockProbationDocumentsResponse.crn },
          },
        }),
      )
    })

    it('Handles API errors', async () => {
      deliusApiClient.getProbationDocuments = jest.fn().mockRejectedValue(new ServerError())

      const response = await service.getDocuments('token', 'ABC')
      expect(response).toEqual(
        expect.objectContaining({
          status: 'rejected',
          reason: new ServerError(),
        }),
      )
    })
  })
})
