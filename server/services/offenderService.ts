import { Readable } from 'stream'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'

export default class OffenderService {
  constructor(private readonly prisonClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  getPrisonerImage(token: string, offenderNumber: string, fullSizeImage = true): Promise<Readable> {
    return this.prisonClientBuilder(token).getPrisonerImage(offenderNumber, fullSizeImage)
  }

  getImage(token: string, imageId: string): Promise<Readable> {
    return this.prisonClientBuilder(token).getImage(imageId, true)
  }
}
