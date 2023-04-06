import { CourtCase } from '../../interfaces/prisonApi/courtCase'
import AgencyMock from './agency'
import CourtHearingsMock from './courtHearingsMock'

const CourtCasesMock: CourtCase = {
  id: 1434365,
  caseSeq: 1,
  beginDate: '2016-05-30',
  agency: AgencyMock,
  caseType: 'Adult',
  caseInfoNumber: 'T20167348',
  caseStatus: 'ACTIVE',
  courtHearings: CourtHearingsMock,
}

export default CourtCasesMock
