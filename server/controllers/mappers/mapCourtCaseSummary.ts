import { CourtCaseSummary } from '../interfaces/OverviewPageData'
import CourtAppearanceSummary from '../../services/interfaces/offencesService/CourtAppearanceSummary'
import { Role } from '../../data/enums/role'
import { userHasRoles } from '../../utils/utils'
import config from '../../config'
import LatestCalculationSummary from '../../services/interfaces/offencesService/LatestCalculationSummary'
import { Result } from '../../utils/result/result'

export default function mapCourtCaseSummary(
  nextCourtCaseAppearance: CourtAppearanceSummary,
  activeCourtCasesCount: number,
  latestCalculation: Result<LatestCalculationSummary | null>,
  userRoles: Role[],
  prisonerNumber: string,
): CourtCaseSummary | null {
  // user does not have access to court case summary or is feature flagged off
  if (nextCourtCaseAppearance === undefined) return null

  return {
    nextCourtAppearance: nextCourtCaseAppearance,
    activeCourtCasesCount,
    latestCalculation: latestCalculation.toPromiseSettledResult(),
    link: {
      text: userHasRoles([Role.AdjustmentsMaintainer], userRoles)
        ? 'Court cases and release dates'
        : 'Calculate release dates',
      href: `${config.serviceUrls.courtCaseReleaseDates}/prisoner/${prisonerNumber}/overview`,
    },
  }
}
