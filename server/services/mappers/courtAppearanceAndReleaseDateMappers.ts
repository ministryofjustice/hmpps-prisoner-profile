import CourtEvent from '../../data/interfaces/prisonApi/CourtEvent'
import CourtAppearanceSummary from '../interfaces/offencesService/CourtAppearanceSummary'

export function mapNextCourtAppearanceSummary(courtEvent: CourtEvent): CourtAppearanceSummary | null {
  if (!Object.keys(courtEvent).length) return null

  return {
    caseReference: courtEvent.caseReference,
    location: courtEvent.courtLocation,
    hearingType: courtEvent.courtEventType,
    date: courtEvent.startTime,
  }
}
