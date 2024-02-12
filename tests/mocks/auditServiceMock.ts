import { AuditService } from '../../server/services/auditService'

export const auditServiceMock = (): AuditService => ({
  sendAccessAttempt: jest.fn().mockImplementation(() => Promise.resolve()),
  sendAddAppointment: jest.fn().mockImplementation(() => Promise.resolve()),
  sendPageView: jest.fn().mockImplementation(() => Promise.resolve()),
  sendSearch: jest.fn().mockImplementation(() => Promise.resolve()),
  sendPostAttempt: jest.fn().mockImplementation(() => Promise.resolve()),
  sendPostSuccess: jest.fn().mockImplementation(() => Promise.resolve()),
  sendPutAttempt: jest.fn().mockImplementation(() => Promise.resolve()),
  sendPutSuccess: jest.fn().mockImplementation(() => Promise.resolve()),
  sendEvent: jest.fn().mockImplementation(() => Promise.resolve()),
})
