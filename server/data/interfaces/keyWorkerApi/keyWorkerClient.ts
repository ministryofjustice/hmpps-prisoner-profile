import StaffAllocation from './StaffAllocation'

export default interface KeyWorkerClient {
  getCurrentAllocations(offenderNumber: string, includeContactDetails?: boolean): Promise<StaffAllocation>
}
