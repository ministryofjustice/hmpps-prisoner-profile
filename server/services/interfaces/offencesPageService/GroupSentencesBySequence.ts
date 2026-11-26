import type { GovukSummaryListRow } from '../../../interfaces/govukComponents'
import OffenderSentenceTerms from '../../../data/interfaces/prisonApi/OffenderSentenceTerms'

export default interface GroupedSentence {
  key: number
  lineSeq: number
  sentenceHeader: string
  caseId: number
  items: OffenderSentenceTerms[]
  summaryListRows: GovukSummaryListRow[]
}
