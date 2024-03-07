import CourtDateResults from '../../../data/interfaces/prisonApi/CourtDateResults'
import { CourtHearing } from '../../../data/interfaces/prisonApi/CourtCase'

export default interface CourtCaseDataMappedUnsentenced {
  sentenced: boolean
  nextCourtAppearance: CourtHearing
  courtHearings: CourtHearing[]
  caseInfoNumber: string
  courtName: string
  sentenceHeader: string
  courtDateResults: CourtDateResults[]
  id?: number
}
