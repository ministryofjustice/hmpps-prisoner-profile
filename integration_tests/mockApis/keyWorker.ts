import { stubFor } from './wiremock'
import { CaseNotesByTypeA } from '../../server/data/localMockData/caseNotes'
import { KeyWorkerStub } from '../../server/interfaces/keyWorker'

export default {
  stubKeyWorkerData: (data: KeyWorkerStub) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/keyworker/key-worker/${data.caseLoadId}/offender/${data.prisonerNumber}`,
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
