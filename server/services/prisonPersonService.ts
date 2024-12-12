import { Readable } from 'stream'
import { RestClientBuilder } from '../data'
import { FieldHistory, PrisonPersonApiClient } from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'

export default class PrisonPersonService {
  constructor(private readonly prisonPersonApiClientBuilder: RestClientBuilder<PrisonPersonApiClient>) {}

  /**
   * Handle request for field history
   *
   * @param token
   * @param prisonerNumber
   * @param field
   */
  public async getFieldHistory(token: string, prisonerNumber: string, field: string): Promise<FieldHistory[]> {
    return this.prisonPersonApiClientBuilder(token).getFieldHistory(prisonerNumber, field)
  }

  getImage(token: string, imageId: string): Promise<Readable> {
    return this.prisonPersonApiClientBuilder(token).getImage(imageId)
  }
}
