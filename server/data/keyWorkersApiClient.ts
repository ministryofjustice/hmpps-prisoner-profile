import RestClient from './restClient'
import config from '../config'
import { KeyWorker } from '../interfaces/keyWorker'

export default class KeyWorkerClient {
  restClient: RestClient

  caseLoadId: string

  constructor(token: string, caseLoadId: string) {
    this.restClient = new RestClient('KeyWorkers API', config.apis.keyworker, token)
    this.caseLoadId = caseLoadId
  }

  async getOffendersKeyWorker(offenderNumber: string): Promise<KeyWorker> {
    try {
      return await this.restClient.get<KeyWorker>({ path: `/key-worker/${this.caseLoadId}/offender/${offenderNumber}` })
    } catch (error) {
      return error
    }
  }
}
