import KeyWorker from '../interfaces/keyWorkerApi/KeyWorker'
import StaffAllocation from '../interfaces/keyWorkerApi/StaffAllocation'

export const keyWorkerMock: KeyWorker = {
  staffId: 3532453,
  firstName: 'Dave',
  lastName: 'Stevens',
  email: '1@1.com',
}

export const StaffAllocationMock: StaffAllocation = {
  hasHighComplexityOfNeeds: false,
  allocations: [
    {
      policy: {
        code: 'KEY_WORKER',
        description: 'Key worker',
      },
      prison: {
        code: 'CODE',
        description: 'Description',
      },
      staffMember: {
        staffId: 3532453,
        firstName: 'Dave',
        lastName: 'Stevens',
      },
    },
  ],
  latestRecordedEvents: [],
}

export default {
  keyWorkerMock,
  StaffAllocationMock,
}
