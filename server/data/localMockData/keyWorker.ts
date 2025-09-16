import StaffAllocation from '../interfaces/keyWorkerApi/StaffAllocation'

export const staffAllocationMock: StaffAllocation = {
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
        emailAddresses: ['new@key.worker'],
      },
    },
    {
      policy: {
        code: 'PERSONAL_OFFICER',
        description: 'Personal officer',
      },
      prison: {
        code: 'CODE',
        description: 'Description',
      },
      staffMember: {
        staffId: 1532453,
        firstName: 'NEW',
        lastName: 'PERSONAL-OFFICER',
        emailAddresses: ['new@personal.officer'],
      },
    },
  ],
  latestRecordedEvents: [
    {
      prison: {
        code: 'CODE',
        description: 'Description',
      },
      policy: 'KEY_WORKER',
      type: 'SESSION',
      occurredAt: '2025-06-24T12:00:00',
    },
  ],
  policies: [
    {
      policy: 'KEY_WORKER',
      enabled: true,
    },
    {
      policy: 'PERSONAL_OFFICER',
      enabled: true,
    },
  ],
}

export default {
  StaffAllocationMock: staffAllocationMock,
}
