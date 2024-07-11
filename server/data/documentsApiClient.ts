import superagent from 'superagent'
import RestClient from './restClient'
import config from '../config'
import DocumentsApiClient from './interfaces/documentsApi/DocumentsApiClient'
import DocumentMeta from './interfaces/documentsApi/DocumentMeta'
import logger from '../../logger'
import DocumentSearchResponse from './interfaces/documentsApi/DocumentSearchResponse'

export default class DocumentsApiRestClient implements DocumentsApiClient {
  private readonly restClient: RestClient

  constructor(private readonly token: string) {
    this.restClient = new RestClient('Documents Service API', config.apis.documentsServiceApi, token)
  }

  async putProfilePhoto(
    document: Buffer,
    metadata: Record<string, string>,
    uuid: string,
    activeCaseLoadId: string,
    username: string,
  ): Promise<DocumentMeta> {
    try {
      const result = await superagent
        .post(`${config.apis.documentsServiceApi.url}/documents/PRISONER_PROFILE_PICTURE/${uuid}`)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set('service-name', 'hmpps-prisoner-profile')
        .set('Active-Case-Load-Id', activeCaseLoadId)
        .set('Username', username)
        .type('form')
        .field('metadata', JSON.stringify(metadata))
        .attach('file', document, 'file.jpg')

      return result.body as DocumentMeta
    } catch (e) {
      logger.error(e)
      throw e
    }
  }

  async getPhoto(uuid: string, activeCaseLoadId: string, username: string): Promise<Buffer> {
    return this.restClient.get<Buffer>({
      path: `/documents/${uuid}/file`,
      headers: {
        'Service-Name': 'hmpps-prisoner-profile',
        'Active-Case-Load-Id': activeCaseLoadId,
        Username: username,
      },
    })
  }

  async getPhotosForPrisoner(
    prisonerNumber: string,
    activeCaseLoadId: string,
    username: string,
  ): Promise<DocumentSearchResponse> {
    return this.restClient.post<DocumentSearchResponse>({
      path: `/documents/search`,
      headers: {
        'Service-Name': 'hmpps-prisoner-profile',
        'Active-Case-Load-Id': activeCaseLoadId,
        Username: username,
      },
      data: {
        documentType: 'PRISONER_PROFILE_PICTURE',
        metadata: { prisonerNumber },
        orderBy: 'CREATED_TIME',
        orderByDirection: 'DESC',
      },
    })
  }
}
