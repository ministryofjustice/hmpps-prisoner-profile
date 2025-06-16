import RestClient from './restClient'
import KeyWorker from './interfaces/keyWorkerApi/KeyWorker'
import config from '../config'
import KeyWorkerClient from './interfaces/keyWorkerApi/keyWorkerClient'

export default class KeyWorkerRestClient implements KeyWorkerClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('KeyWorkers API', config.apis.keyworker, token)
  }

  async getOffendersKeyWorker(offenderNumber: string): Promise<KeyWorker> {
    return this.restClient.get<KeyWorker>({ path: `/key-worker/offender/${offenderNumber}`, ignore404: true })
  }
}
