import { SummaryListRow } from '../utils/utils'
import OffenderSentenceTerms from '../data/interfaces/prisonApi/OffenderSentenceTerms'

export interface GroupedSentence {
  key: number
  lineSeq: number
  sentenceHeader: string
  caseId: number
  items: OffenderSentenceTerms[]
  summaryListRows: SummaryListRow[]
}
