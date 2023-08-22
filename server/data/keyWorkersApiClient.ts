import RestClient from './restClient'
import { KeyWorker } from '../interfaces/keyWorker'

export default class KeyWorkerClient {
  constructor(private readonly restClient: RestClient) {}

  async getOffendersKeyWorker(offenderNumber: string): Promise<KeyWorker> {
    return this.restClient.get<KeyWorker>({ path: `/key-worker/offender/${offenderNumber}`, ignore404: true })
  }
}
