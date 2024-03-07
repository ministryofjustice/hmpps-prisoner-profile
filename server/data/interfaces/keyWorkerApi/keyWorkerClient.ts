import KeyWorker from './KeyWorker'

export default interface KeyWorkerClient {
  getOffendersKeyWorker(prisonerNumber: string): Promise<KeyWorker>
}
