import { ReferenceDataCodeDto, ReferenceDataDomain } from '../../data/interfaces/referenceData'

export interface ReferenceDataSource {
  getReferenceDataCodes(domain: ReferenceDataDomain, token: string): Promise<ReferenceDataCodeDto[]>
}
