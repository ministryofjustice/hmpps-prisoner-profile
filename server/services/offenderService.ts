import PrisonApiClient from '../data/prisonApiClient'

export default class OffenderService {
  getPrisonerImage(token: string, offenderNumber: string): Promise<string> {
    return new PrisonApiClient(token).getPrisonerImage(offenderNumber, true)
  }
}
