import config from '../../config'
import type { ReferenceDataDomain } from '../../data/interfaces/referenceData'
import { HealthAndMedicationReferenceDataDomain } from '../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import type { HealthAndMedicationApiClient } from '../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { personApiClientMock } from '../../../tests/mocks/personApiClientMock'
import { PersonCommunicationNeedsReferenceDataDomain } from '../../data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import type { PersonCommunicationNeedsApiClient } from '../../data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import { CorePersonRecordReferenceDataDomain } from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { personIntegrationApiClientMock } from '../../../tests/mocks/personIntegrationApiClientMock'
import { PersonalRelationshipsReferenceDataDomain } from '../../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import type { PersonalRelationshipsApiClient } from '../../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import { ReferenceDataSourceFactory } from './referenceDataSourceFactory'

describe('referenceDataSourceFactory', () => {
  const personApiClient = personApiClientMock()
  const healthAndMedicationApiClient = {
    getReferenceDataCodes: jest.fn(() => Promise.resolve([])),
  } as unknown as jest.Mocked<HealthAndMedicationApiClient>
  const personCommunicationNeedsApiClient = {
    getReferenceDataCodes: jest.fn(() => Promise.resolve([])),
  } as unknown as jest.Mocked<PersonCommunicationNeedsApiClient>
  const personIntegrationApiClient = personIntegrationApiClientMock()
  const personalRelationshipsApiClient = {
    getReferenceDataCodes: jest.fn(() => Promise.resolve([])),
  } as unknown as jest.Mocked<PersonalRelationshipsApiClient>

  beforeEach(() => {
    jest.resetAllMocks()
    personApiClient.getReligionCodes.mockResolvedValue([])
    healthAndMedicationApiClient.getReferenceDataCodes.mockResolvedValue([])
    personCommunicationNeedsApiClient.getReferenceDataCodes.mockResolvedValue([])
    personIntegrationApiClient.getReferenceDataCodes.mockResolvedValue([])
    personalRelationshipsApiClient.getReferenceDataCodes.mockResolvedValue([])
  })

  const newFactory = () =>
    new ReferenceDataSourceFactory(
      () => personApiClient,
      () => personIntegrationApiClient,
      () => healthAndMedicationApiClient,
      () => personCommunicationNeedsApiClient,
      () => personalRelationshipsApiClient,
    )

  const allDomains: ReferenceDataDomain[] = [
    ...Object.values(CorePersonRecordReferenceDataDomain),
    ...Object.values(HealthAndMedicationReferenceDataDomain),
    ...Object.values(PersonCommunicationNeedsReferenceDataDomain),
    ...Object.values(PersonalRelationshipsReferenceDataDomain),
  ]
  it.each(allDomains)('should supply a data source for %s domain', domain => {
    const referenceDataSourceFactory = newFactory()
    const dataSource = referenceDataSourceFactory.getReferenceDataSourceFor(domain)
    expect(dataSource.getReferenceDataCodes).toBeInstanceOf(Function)
  })

  it.each([
    { expectedApi: 'person integration api', usePersonApi: false },
    { expectedApi: 'core person record api', usePersonApi: true },
  ])(
    'should call $expectedApi for religion domain when “use CPR for religion” feature flag is $usePersonApi',
    ({ usePersonApi }) => {
      config.featureToggles.usePersonApi.religion = usePersonApi
      const referenceDataSourceFactory = newFactory()

      const dataSource = referenceDataSourceFactory.getReferenceDataSourceFor(
        CorePersonRecordReferenceDataDomain.religion,
      )
      expect(
        dataSource.getReferenceDataCodes(CorePersonRecordReferenceDataDomain.religion, 'sess-token-1'),
      ).resolves.toBeInstanceOf(Array)

      if (usePersonApi) {
        expect(personApiClient.getReligionCodes).toHaveBeenCalledWith(false)
        expect(personIntegrationApiClient.getReferenceDataCodes).not.toHaveBeenCalled()
      } else {
        expect(personApiClient.getReligionCodes).not.toHaveBeenCalled()
        expect(personIntegrationApiClient.getReferenceDataCodes).toHaveBeenCalledWith(
          CorePersonRecordReferenceDataDomain.religion,
        )
      }
    },
  )
})
