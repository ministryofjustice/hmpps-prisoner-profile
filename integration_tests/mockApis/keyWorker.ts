import { stubFor } from './wiremock'
import { CaseNotesByTypeA } from '../../server/data/localMockData/caseNotes'

export default {
  stubKeyWorkerData: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/keyworker/key-worker/offender/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: CaseNotesByTypeA,
      },
    })
  },
}
