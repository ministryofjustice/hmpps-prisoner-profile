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
        firstName: 'NEW',
        lastName: 'KEY-WORKER',
      },
    },
  ],
  latestRecordedEvents: [
    {
      prison: {
        code: 'CODE',
        description: 'Description',
      },
      type: 'SESSION',
      occurredAt: '2025-06-24T12:00:00',
    },
  ],
}

export default {
  keyWorkerMock,
  StaffAllocationMock,
}
