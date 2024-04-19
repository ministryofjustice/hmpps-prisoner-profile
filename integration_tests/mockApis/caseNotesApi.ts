import { stubFor } from './wiremock'
import {
  emptyCaseNotesMock,
  pagedCaseNotesMock,
  pagedCaseNotesMockFiltered,
  pagedCaseNotesMockPage2,
  pagedCaseNotesMockSorted,
  pomCaseNotesMock,
  singleCaseNoteWithTypes,
} from '../../server/data/localMockData/pagedCaseNotesMock'
import { caseNoteTypesMock } from '../../server/data/localMockData/caseNoteTypesMock'

export default {
  stubGetCaseNotes: ({
    prisonerNumber,
    includeSensitive = false,
  }: {
    prisonerNumber: string
    includeSensitive?: boolean
  }) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pagedCaseNotesMock
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20${includeSensitive ? '&includeSensitive=true' : '&includeSensitive=false'}`,
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
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20&page=1&includeSensitive=false`,
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
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20&sort=creationDateTime%2CASC&includeSensitive=false`,
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
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20&type=ACP&includeSensitive=false`,
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

  stubGetCaseNoteTypesForUser: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/types-for-user`,
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
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20&type=OMIC&includeSensitive=true`,
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

  stubSingleCaseNoteWithType: ({
    prisonerNumber,
    type,
    subType,
  }: {
    prisonerNumber: string
    type: string
    subType: string
  }) => {
    const jsonResp = singleCaseNoteWithTypes(prisonerNumber, type, subType)

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/${prisonerNumber}\\?size=20&type=${type}&includeSensitive=false`,
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

  stubAddCaseNote: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/casenotes/case-notes/G6123VU`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pagedCaseNotesMock.content[0],
      },
    })
  },

  stubGetCaseNote: ({
    prisonerNumber,
    caseNoteId,
    isOmic,
    longText,
  }: {
    prisonerNumber: string
    caseNoteId: string
    isOmic?: boolean
    longText?: boolean
  }) => {
    // eslint-disable-next-line no-nested-ternary
    const jsonBody = longText
      ? pagedCaseNotesMock.content[3]
      : isOmic
        ? pomCaseNotesMock.content[0]
        : pagedCaseNotesMock.content[0]
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/casenotes/case-notes/${prisonerNumber}/${caseNoteId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody,
      },
    })
  },

  stubUpdateCaseNote: () => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/casenotes/case-notes/G6123VU/123456`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pagedCaseNotesMock.content[0],
      },
    })
  },
}
