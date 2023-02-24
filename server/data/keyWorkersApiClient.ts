import RestClient from './restClient'
import config from '../config'
import { KeyWorker } from '../interfaces/keyWorker'

export default class KeyWorkerClient {
  restClient: RestClient

  caseLoadId: string

  constructor(token: string) {
    this.restClient = new RestClient('KeyWorkers API', config.apis.keyworker, token)
  }

  async getOffendersKeyWorker(offenderNumber: string): Promise<KeyWorker> {
    try {
      return await this.restClient.get<KeyWorker>({ path: `/key-worker/offender/${offenderNumber}` })
    } catch (error) {
      return error
    }
  }
}
