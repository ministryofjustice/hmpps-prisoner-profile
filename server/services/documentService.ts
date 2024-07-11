import { v4 as uuidv4 } from 'uuid'
import { RestClientBuilder } from '../data'

import DocumentsApiClient from '../data/interfaces/documentsApi/DocumentsApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'
import DocumentMeta from '../data/interfaces/documentsApi/DocumentMeta'

export default class DocumentService {
  constructor(private readonly documentsApiClientBuilder: RestClientBuilder<DocumentsApiClient>) {}

  async putProfilePhoto(token: string, document: Buffer, metadata: Record<string, string>, user: PrisonUser) {
    const documentsApiClient = this.documentsApiClientBuilder(token)
    const uuid = uuidv4()
    const { activeCaseLoadId, username } = user

    return documentsApiClient.putProfilePhoto(document, metadata, uuid, activeCaseLoadId, username)
  }

  async getPhoto(token: string, uuid: string, user: PrisonUser) {
    const documentsApiClient = this.documentsApiClientBuilder(token)
    const { activeCaseLoadId, username } = user

    return documentsApiClient.getPhoto(uuid, activeCaseLoadId, username)
  }

  async getAllPhotosForPrisoner(token: string, prisonerNumber: string, user: PrisonUser): Promise<DocumentMeta[]> {
    const documentsApiClient = this.documentsApiClientBuilder(token)
    const { activeCaseLoadId, username } = user

    const response = await documentsApiClient.getPhotosForPrisoner(prisonerNumber, activeCaseLoadId, username)
    return response.results
  }
}
