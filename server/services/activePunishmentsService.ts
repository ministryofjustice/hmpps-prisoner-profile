import { Prisoner } from '../interfaces/prisoner'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { RestClientBuilder } from '../data'
import { AdjudicationsApiClient } from '../data/interfaces/adjudicationsApiClient'

export default class ActivePunishmentsService {
  constructor(private readonly adjudicationsApiClientBuilder: RestClientBuilder<AdjudicationsApiClient>) {}

  public async get(token: string, prisonerData: Prisoner) {
    const adjudicationsApiClient = this.adjudicationsApiClientBuilder(token)
    const { bookingId, firstName, middleNames, lastName } = prisonerData

    const adjudications = await adjudicationsApiClient.getAdjudications(bookingId)
    const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    return {
      adjudications,
      name,
    }
  }
}
