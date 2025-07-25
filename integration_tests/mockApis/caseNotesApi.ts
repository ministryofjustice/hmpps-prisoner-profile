import { stubFor } from './wiremock'
import { caseNoteTypesMock } from '../../server/data/localMockData/caseNoteTypesMock'
import {
  emptyFindCaseNotesMock,
  findCaseNotesMock,
  findCaseNotesMockFiltered,
  findCaseNotesMockPage2,
  findCaseNotesMockSorted,
  findPomCaseNotesMock,
  findSingleCaseNoteWithTypes,
} from '../../server/data/localMockData/findCaseNotesMock'

export default {
  stubGetCaseNotes: ({ prisonerNumber }: { prisonerNumber: string }) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = findCaseNotesMock
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyFindCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/casenotes/search/case-notes/${prisonerNumber}`,
        bodyPatterns: [
          {
            contains: '"page":1',
          },
        ],
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
      jsonResp = findCaseNotesMockPage2
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyFindCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/casenotes/search/case-notes/${prisonerNumber}`,
        bodyPatterns: [
          {
            contains: '"page":2',
          },
        ],
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
      jsonResp = findCaseNotesMockSorted
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyFindCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/casenotes/search/case-notes/${prisonerNumber}`,
        bodyPatterns: [
          {
            contains: '"sort":"createdAt,ASC"',
          },
        ],
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
      jsonResp = findCaseNotesMockFiltered
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyFindCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/casenotes/search/case-notes/${prisonerNumber}`,
        bodyPatterns: [
          {
            contains: '"type":"ACP"',
          },
        ],
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
        urlPathPattern: `/casenotes/case-notes/types*`,
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
      jsonResp = findPomCaseNotesMock
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyFindCaseNotesMock
    }
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/casenotes/search/case-notes/${prisonerNumber}`,
        bodyPatterns: [
          {
            contains: '"type":"OMIC"',
          },
          {
            contains: '"includeSensitive":true',
          },
        ],
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
    const jsonResp = findSingleCaseNoteWithTypes(prisonerNumber, type, subType)

    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/casenotes/search/case-notes/${prisonerNumber}`,
        bodyPatterns: [
          {
            contains: `"type":"${type}"`,
          },
        ],
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
        jsonBody: findCaseNotesMock.content[0],
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
      ? findCaseNotesMock.content[3]
      : isOmic
        ? findPomCaseNotesMock.content[0]
        : findCaseNotesMock.content[0]
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
        jsonBody: findCaseNotesMock.content[0],
      },
    })
  },
}
