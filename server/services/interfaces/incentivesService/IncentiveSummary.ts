export default interface IncentiveSummary {
  positiveBehaviourCount: number
  negativeBehaviourCount: number
  nextReviewDate: string
  daysOverdue: number | undefined
}

export const isIncentiveSummaryError = (
  incentiveSummary: IncentiveSummary | { error: true },
): incentiveSummary is { error: true } => {
  return 'error' in incentiveSummary
}
