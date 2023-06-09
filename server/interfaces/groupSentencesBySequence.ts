import { SummaryListRow } from '../utils/utils'
import { OffenderSentenceTerms } from './prisonApi/offenderSentenceTerms'

export interface GroupedSentence {
  key: number
  lineSeq: number
  sentenceHeader: string
  caseId: number
  items: OffenderSentenceTerms[]
  summaryListRows: SummaryListRow[]
}
