import { stubFor } from './wiremock'
import { restrictedPatientMock } from '../../server/data/localMockData/restrictedPatientApi/restrictedPatient'

export default {
  stubGetRestrictedPatient: ({
    prisonerNumber,
    supportingPrisonId,
  }: {
    prisonerNumber: string
    supportingPrisonId: string
  }) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/restrictedPatient/restricted-patient/prison-number/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { ...restrictedPatientMock, supportingPrison: { agencyId: supportingPrisonId, active: true } },
      },
    })
  },

  stubRestrictedPatientApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/restrictedPatient/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
