import { Readable } from 'stream'
import { RestClientBuilder } from '../data'
import { PrisonPersonApiClient } from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'

export default class PrisonPersonService {
  constructor(private readonly prisonPersonApiClientBuilder: RestClientBuilder<PrisonPersonApiClient>) {}

  getImage(token: string, imageId: string): Promise<{ stream: Readable; contentType: string }> {
    return this.prisonPersonApiClientBuilder(token).getImage(imageId)
  }
}
