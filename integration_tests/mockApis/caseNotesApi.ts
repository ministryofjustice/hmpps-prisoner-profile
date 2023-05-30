import { stubFor } from './wiremock'
import {
  emptyCaseNotesMock,
  pagedCaseNotesMock,
  pagedCaseNotesMockFiltered,
  pagedCaseNotesMockPage2,
  pagedCaseNotesMockSorted,
  pomCaseNotesMock,
} from '../../server/data/localMockData/pagedCaseNotesMock'
import { caseNoteTypesMock } from '../../server/data/localMockData/caseNoteTypesMock'

export default {
  stubGetCaseNotes: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pagedCaseNotesMock
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: jsonResp,
      },
    })
  },

  stubGetCaseNotesPage2: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pagedCaseNotesMockPage2
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20&page=1`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: jsonResp,
      },
    })
  },

  stubGetCaseNotesSorted: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pagedCaseNotesMockSorted
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20&sort=creationDateTime%2CASC`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: jsonResp,
      },
    })
  },

  stubGetCaseNotesFiltered: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pagedCaseNotesMockFiltered
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20&type=ACP`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: jsonResp,
      },
    })
  },

  stubGetCaseNoteTypes: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/types`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: caseNoteTypesMock,
      },
    })
  },

  stubGetSensitiveCaseNotesPage: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pomCaseNotesMock
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20&type=OMIC`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: jsonResp,
      },
    })
  },
}
