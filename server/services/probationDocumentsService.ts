import { RestClientBuilder } from '../data'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/deliusApi/prisonerProfileDeliusApiClient'
import Conviction from '../data/interfaces/deliusApi/Conviction'
import { ProbationDocument } from '../data/interfaces/deliusApi/ProbationDocuments'
import { Result } from '../utils/result/result'

interface GetCommunityDocumentsResponse {
  documents: {
    offenderDocuments: ProbationDocument[]
    convictions: Conviction[]
  }
  probationDetails: { name: string; crn: string }
}

export default class ProbationDocumentsService {
  constructor(private readonly deliusApiClientBuilder: RestClientBuilder<PrisonerProfileDeliusApiClient>) {}

  public async getDocuments(
    token: string,
    prisonerNumber: string,
  ): Promise<Result<GetCommunityDocumentsResponse, Error>> {
    const probationDocuments = await Result.wrap(
      this.deliusApiClientBuilder(token).getProbationDocuments(prisonerNumber),
    )

    return probationDocuments.map(val => {
      const { documents, convictions, name, crn } = val
      return {
        documents: { offenderDocuments: documents ?? [], convictions },
        probationDetails: { name: `${name?.forename} ${name?.surname}`, crn },
      }
    })
  }
}
