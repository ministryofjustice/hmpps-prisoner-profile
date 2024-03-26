import {
  SentenceSummaryCourtCaseExtended,
  SentenceSummaryCourtSentence,
} from '../../../data/interfaces/prisonApi/SentenceSummary'
import CourtCase from '../../../data/interfaces/prisonApi/CourtCase'

export default interface SentencedCourtCase extends SentenceSummaryCourtCaseExtended {
  courtHearings: CourtCase['courtHearings']
  sentences: SentenceSummaryCourtSentence[]
}
