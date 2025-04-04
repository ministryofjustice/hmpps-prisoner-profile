import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import { prisonUserMock } from '../../server/data/localMockData/user'
import CaseLoad from '../../server/data/interfaces/prisonApi/CaseLoad'

export const prisonerMDI = PrisonerMockDataA
export const prisonerOUT = { ...PrisonerMockDataA, prisonId: 'OUT' }
export const prisonerTRN = { ...PrisonerMockDataA, prisonId: 'TRN' }
export const restrictedPrisonerMDI = {
  ...PrisonerMockDataA,
  restrictedPatient: true,
}
export const restrictedPatientMDI = {
  ...PrisonerMockDataA,
  restrictedPatient: true,
  prisonId: 'OUT',
  supportingPrisonId: 'MDI',
}
export const userMDI = prisonUserMock
export const userLEI = {
  ...prisonUserMock,
  activeCaseLoadId: 'LEI',
  caseLoads: [{ caseLoadId: 'LEI', currentlyActive: true } as CaseLoad],
}
