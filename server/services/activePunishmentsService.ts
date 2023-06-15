import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Prisoner } from '../interfaces/prisoner'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'

export default class ActivePunishmentsService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner) {
    const { bookingId, firstName, middleNames, lastName } = prisonerData

    const adjudications = await this.getAdjudications(bookingId)
    const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    return {
      adjudications,
      name,
    }
  }

  private async getAdjudications(bookingId: number) {
    const adjudications = await this.prisonApiClient.getAdjudications(bookingId)
    return adjudications
  }
}
