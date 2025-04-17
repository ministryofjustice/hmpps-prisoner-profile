import CourtEvent from '../../data/interfaces/prisonApi/CourtEvent'
import CourtAppearanceSummary from '../interfaces/offencesService/CourtAppearanceSummary'
import LatestCalculation from '../../data/interfaces/calculateReleaseDatesApi/LatestCalculation'
import LatestCalculationSummary from '../interfaces/offencesService/LatestCalculationSummary'

export function mapNextCourtAppearanceSummary(courtEvent: CourtEvent): CourtAppearanceSummary | null {
  if (!Object.keys(courtEvent).length) return null

  return {
    caseReference: courtEvent.caseReference,
    location: courtEvent.courtLocation,
    hearingType: courtEvent.courtEventType,
    date: courtEvent.startTime,
  }
}

export function mapLatestCalculationSummary(
  latestCalculation: LatestCalculation | null,
): LatestCalculationSummary | null {
  if (!latestCalculation) return null
  const { source } = latestCalculation

  return {
    calculationDate: latestCalculation.calculatedAt,
    establishment: source === 'CRDS' ? latestCalculation.establishment : null,
    reason: latestCalculation.reason,
  }
}
