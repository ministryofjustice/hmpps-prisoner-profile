import { KeyWorker } from '../../interfaces/keyWorker'

export default interface KeyWorkerClient {
  getOffendersKeyWorker(prisonerNumber: string): Promise<KeyWorker>
}
