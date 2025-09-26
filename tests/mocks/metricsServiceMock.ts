import MetricsService from '../../server/services/metrics/metricsService'

export const metricsServiceMock = (): MetricsService => ({
  trackPrisonPersonUpdate: jest.fn(),
  trackPersonIntegrationUpdate: jest.fn(),
  trackHealthAndMedicationUpdate: jest.fn(),
  trackPersonCommunicationNeedsUpdate: jest.fn(),
  trackPersonalRelationshipsUpdate: jest.fn(),
  trackNomisLockedWarning: jest.fn(),
})

export default { metricsServiceMock }
