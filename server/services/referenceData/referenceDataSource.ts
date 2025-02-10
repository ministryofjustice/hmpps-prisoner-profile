import { ReferenceDataCodeDto, ReferenceDataDomain } from '../../data/interfaces/referenceData'

export interface ReferenceDataSource {
  getActiveReferenceDataCodes(domain: ReferenceDataDomain, token: string): Promise<ReferenceDataCodeDto[]>
}
