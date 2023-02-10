import PrisonApiClient from '../data/prisonApiClient'

export default class OffenderService {
  getPrisonerImage<T>(token: string, offenderNumber: string): Promise<T> {
    return new PrisonApiClient(token).getPrisonerImage<T>(offenderNumber, true)
  }
}
