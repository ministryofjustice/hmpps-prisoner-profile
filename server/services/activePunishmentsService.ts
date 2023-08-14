import { Prisoner } from '../interfaces/prisoner'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { RestClientBuilder } from '../data'
import { AdjudicationsApiClient } from '../data/interfaces/adjudicationsApiClient'

export default class ActivePunishmentsService {
  private adjudicationsApiClient: AdjudicationsApiClient

  constructor(private readonly adjudicationsApiClientBuilder: RestClientBuilder<AdjudicationsApiClient>) {}

  public async get(token: string, prisonerData: Prisoner) {
    this.adjudicationsApiClient = this.adjudicationsApiClientBuilder(token)
    const { bookingId, firstName, middleNames, lastName } = prisonerData

    const adjudications = await this.getAdjudications(bookingId)
    const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    return {
      adjudications,
      name,
    }
  }

  private async getAdjudications(bookingId: number) {
    const adjudications = await this.adjudicationsApiClient.getAdjudications(bookingId)
    return adjudications
  }
}
