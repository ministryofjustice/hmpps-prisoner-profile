import KeyWorker from './KeyWorker'
import StaffAllocation from './StaffAllocation'

export default interface KeyWorkerClient {
  getOffendersKeyWorker(prisonerNumber: string): Promise<KeyWorker>
  getCurrentAllocations(offenderNumber: string): Promise<StaffAllocation>
}
