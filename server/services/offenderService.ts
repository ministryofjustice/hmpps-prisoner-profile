import { Readable } from 'stream'
import PrisonApiClient from '../data/prisonApiClient'

export default class OffenderService {
  getPrisonerImage(token: string, offenderNumber: string): Promise<Readable> {
    return new PrisonApiClient(token).getPrisonerImage(offenderNumber, true)
  }
}
