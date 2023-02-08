import PrisonApiClient from '../data/prisonApiClient'
import { Offender } from '../interfaces/offender'

export default class OffenderService {
  getOffender(token: string, offenderNumber: string): Promise<Offender> {
    return new PrisonApiClient(token).getOffender(offenderNumber)
  }

  getPrisonerImage(token: string, offenderNumber: string): Promise<string> {
    return new PrisonApiClient(token).getPrisonerImage(offenderNumber, true)
  }
}
