import { Readable } from 'stream'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import PrisonerDetail from '../data/interfaces/prisonApi/PrisonerDetail'
import { NonAssociationsApiClient } from '../data/interfaces/nonAssociationsApi/nonAssociationsApiClient'
import NonAssociationSummary from './interfaces/offenderService/NonAssociationSummary'

export default class OffenderService {
  constructor(
    private readonly prisonClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly nonAssociationsApiClientBuilder: RestClientBuilder<NonAssociationsApiClient>,
  ) {}

  getPrisonerImage(token: string, offenderNumber: string, fullSizeImage = true): Promise<Readable> {
    return this.prisonClientBuilder(token).getPrisonerImage(offenderNumber, fullSizeImage)
  }

  getImage(token: string, imageId: string): Promise<Readable> {
    return this.prisonClientBuilder(token).getImage(imageId, true)
  }

  getPrisoner(token: string, prisonerNumber: string): Promise<PrisonerDetail> {
    return this.prisonClientBuilder(token).getPrisoner(prisonerNumber)
  }

  async getPrisonerNonAssociationOverview(
    clientToken: string,
    prisonerNumber: string,
    apiErrorCallback: (error: Error) => void = () => null,
  ): Promise<NonAssociationSummary> {
    const nonAssociationsApiClient = this.nonAssociationsApiClientBuilder(clientToken)
    try {
      const prisonerNonAssociations = await nonAssociationsApiClient.getPrisonerNonAssociations(prisonerNumber, {
        includeOtherPrisons: 'true',
      })
      const prisonCount = prisonerNonAssociations.nonAssociations.filter(
        na => na.otherPrisonerDetails.prisonId === prisonerNonAssociations.prisonId,
      ).length

      const otherPrisonsCount = prisonerNonAssociations.nonAssociations.filter(
        na =>
          na.otherPrisonerDetails.prisonId !== prisonerNonAssociations.prisonId &&
          !['TRN', 'OUT'].includes(na.otherPrisonerDetails.prisonId),
      ).length

      return {
        prisonName: prisonerNonAssociations.prisonName,
        prisonCount,
        otherPrisonsCount,
      }
    } catch (error) {
      apiErrorCallback(error)
      return {
        prisonName: null,
        prisonCount: 0,
        otherPrisonsCount: 0,
        apiError: true,
      }
    }
  }
}
