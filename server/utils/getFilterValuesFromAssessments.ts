import CsraAssessment from '../data/interfaces/prisonApi/CsraAssessment'
import { CsraSummary } from '../mappers/csraAssessmentsToSummaryListMapper'

interface CsraFilterValues {
  csraLevels: { value: CsraAssessment['classificationCode']; text: string; checked: boolean }[]
  establishments: { value: string; text: string; checked: boolean }[]
  to?: string
  from?: string
}

export default (
  csraAssessments: CsraSummary[],
  filters: {
    csra?: CsraAssessment['classificationCode'] | CsraAssessment['classificationCode'][]
    location?: string | string[]
    to?: string
    from?: string
  },
): CsraFilterValues => {
  const csraFilters = [filters.csra].flat()
  const locationFilters = [filters.location].flat()

  const uniqueEstablishments = [...new Map(csraAssessments.map(csra => [csra.assessmentAgencyId, csra])).values()]
    .filter(csra => csra.assessmentAgencyId && csra.location !== 'Not entered')
    .map(csra => ({
      value: csra.assessmentAgencyId,
      text: csra.location,
      checked: locationFilters.includes(csra.assessmentAgencyId),
    }))

  const uniqueCsraLevels = [...new Map(csraAssessments.map(csra => [csra.classificationCode, csra])).values()].map(
    csra => ({
      value: csra.classificationCode,
      text: csra.classification,
      checked: csraFilters.includes(csra.classificationCode),
    }),
  )

  return {
    establishments: uniqueEstablishments,
    csraLevels: uniqueCsraLevels,
    to: filters.to,
    from: filters.from,
  }
}
