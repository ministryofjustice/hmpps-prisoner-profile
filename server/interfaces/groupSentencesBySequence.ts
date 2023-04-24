import { SummaryListRow } from '../utils/utils'
import { OffenderSentenceTerms } from './prisonApi/offenderSentenceTerms'

export interface GroupedSentence {
  key: number
  lineSeq: number
  sentenceHeader: string
  caseId: string
  items: OffenderSentenceTerms[]
  summaryListRows: SummaryListRow[]
}
