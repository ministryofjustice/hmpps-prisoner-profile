import type { AuditService } from '../../server/services/interfaces/auditService'

export const auditServiceMock = (): jest.Mocked<AuditService> => ({
  sendAccessAttempt: jest.fn().mockResolvedValue(undefined),
  sendPageView: jest.fn().mockResolvedValue(undefined),
  sendSearch: jest.fn().mockResolvedValue(undefined),
  sendPostAttempt: jest.fn().mockResolvedValue(undefined),
  sendPostSuccess: jest.fn().mockResolvedValue(undefined),
  sendPutAttempt: jest.fn().mockResolvedValue(undefined),
  sendPutSuccess: jest.fn().mockResolvedValue(undefined),
  sendEvent: jest.fn().mockResolvedValue(undefined),
})

export default { auditServiceMock }
