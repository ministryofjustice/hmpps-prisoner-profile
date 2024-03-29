import { RestClientBuilder } from '../data'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/deliusApi/prisonerProfileDeliusApiClient'
import Conviction from '../data/interfaces/deliusApi/Conviction'
import { ProbationDocument } from '../data/interfaces/deliusApi/ProbationDocuments'

interface GetCommunityDocumentsResponse {
  notFound: boolean
  data?: {
    documents: {
      offenderDocuments: ProbationDocument[]
      convictions: Conviction[]
    }
    probationDetails: { name: string; crn: string }
  }
}

export default class ProbationDocumentsService {
  constructor(private readonly dealiusApiClientBuilder: RestClientBuilder<PrisonerProfileDeliusApiClient>) {}

  public async getDocuments(token: string, prisonerNumber: string): Promise<GetCommunityDocumentsResponse> {
    try {
      const { name, crn, documents, convictions } =
        await this.dealiusApiClientBuilder(token).getProbationDocuments(prisonerNumber)

      return {
        notFound: false,
        data: {
          documents: { offenderDocuments: documents ?? [], convictions },
          probationDetails: { name: `${name?.forename} ${name?.surname}`, crn },
        },
      }
    } catch (error) {
      if (error.status && error.status === 404) {
        return { notFound: true }
      }
      throw error
    }
  }
}
