import { Readable } from 'stream'
import PrisonApiClient from '../data/prisonApiClient'

export default class OffenderService {
  getPrisonerImage(token: string, offenderNumber: string): Promise<Readable> {
    return new PrisonApiClient(token).getPrisonerImage(offenderNumber, true)
  }

  getImage(token: string, imageId: string): Promise<Readable> {
    return new PrisonApiClient(token).getImage(imageId, true)
  }
}
