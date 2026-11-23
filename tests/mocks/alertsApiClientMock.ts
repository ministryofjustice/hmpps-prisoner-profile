import type { AlertsApiClient } from '../../server/data/interfaces/alertsApi/alertsApiClient'

// eslint-disable-next-line import/prefer-default-export
export const alertsApiClientMock = (): jest.Mocked<AlertsApiClient> => ({
  createAlert: jest.fn(),
  getAlertDetails: jest.fn(),
  updateAlert: jest.fn(),
  getAlerts: jest.fn(),
  getAlertTypes: jest.fn(),
})
