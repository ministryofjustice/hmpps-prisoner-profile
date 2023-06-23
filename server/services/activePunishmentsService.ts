import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Prisoner } from '../interfaces/prisoner'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { RestClientBuilder } from '../data'

export default class ActivePunishmentsService {
  private prisonApiClient: PrisonApiClient

  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async get(token: string, prisonerData: Prisoner) {
    this.prisonApiClient = this.prisonApiClientBuilder(token)
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
