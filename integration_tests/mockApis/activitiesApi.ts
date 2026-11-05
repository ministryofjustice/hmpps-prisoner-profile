import { stubFor } from './wiremock'

export default {
  stubAttendanceSummary: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/activitiesApi/attendances/prisoner/${prisonerNumber}/attendance-summary`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { acceptableAbsence: 0, unacceptableAbsence: 0, total: 0 },
      },
    })
  },
}
