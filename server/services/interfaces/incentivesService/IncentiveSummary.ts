export default interface IncentiveSummary {
  positiveBehaviourCount: number
  negativeBehaviourCount: number
  nextReviewDate: string
  daysOverdue: number | undefined
}
