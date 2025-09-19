import ReferenceDataService from '../../server/services/referenceData/referenceDataService'
import { CorePersonRecordReferenceDataDomain } from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { phoneUsageReferenceDataMock } from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import { ReferenceDataCodeDto } from '../../server/data/interfaces/referenceData'

export const referenceDataServiceMock = (): ReferenceDataService =>
  ({
    getActiveReferenceDataCodes: jest.fn(async (code: string, _): Promise<ReferenceDataCodeDto[]> => {
      switch (code) {
        case CorePersonRecordReferenceDataDomain.phoneTypes:
          return phoneUsageReferenceDataMock
        default:
          return []
      }
    }),
    getReferenceData: jest.fn(),
  }) as unknown as ReferenceDataService

export default { referenceDataServiceMock }
