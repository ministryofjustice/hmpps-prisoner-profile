export default interface StaffAllocation {
  hasHighComplexityOfNeeds: boolean
  allocations: {
    policy: {
      code: string
      description: string
    }
    prison: {
      code: string
      description: string
    }
    staffMember: {
      staffId: number
      firstName: string
      lastName: string
      emailAddresses: string[]
    }
  }[]
  latestRecordedEvents: {
    prison: {
      code: string
      description: string
    }
    policy: string
    type: string
    occurredAt: string
  }[]
}
