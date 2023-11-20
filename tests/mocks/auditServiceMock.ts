import { AuditService } from '../../server/services/auditService'

// eslint-disable-next-line import/prefer-default-export
export const auditServiceMock = (): AuditService => ({
  sendAccessAttempt: jest.fn(),
  sendAddAppointment: jest.fn(),
  sendPageView: jest.fn(),
  sendSearch: jest.fn(),
  sendPostAttempt: jest.fn(),
  sendPostSuccess: jest.fn(),
  sendEvent: jest.fn(),
})
