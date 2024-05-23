import { stubFor } from './wiremock'
import {
  emptyAlertsMock,
  pagedActiveAlertsMock,
  pagedActiveAlertsMockFiltered,
  pagedActiveAlertsMockPage2,
  pagedActiveAlertsMockSorted,
  pagedInactiveAlertsMock,
} from '../../server/data/localMockData/pagedAlertsMock'
import { alertTypesMock } from '../../server/data/localMockData/alertTypesMock'
import { alertDetailsExpiresMock, alertDetailsMock } from '../../server/data/localMockData/alertDetailsMock'

export default {
  stubActiveAlerts: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pagedActiveAlertsMock
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyAlertsMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/${prisonerNumber}/alerts.*`,
        queryParameters: {
          sort: {
            matches: '.*',
          },
          isActive: {
            equalTo: 'true',
          },
          size: {
            equalTo: '20',
          },
        },
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

  stubActiveAlertsPage2: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pagedActiveAlertsMockPage2
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyAlertsMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/${prisonerNumber}/alerts.*`,
        queryParameters: {
          page: {
            equalTo: '1',
          },
          sort: {
            matches: '.*',
          },
          isActive: {
            equalTo: 'true',
          },
          size: {
            equalTo: '20',
          },
        },
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

  stubActiveAlertsSorted: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pagedActiveAlertsMockSorted
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyAlertsMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/${prisonerNumber}/alerts.*`,
        queryParameters: {
          sort: {
            matches: 'activeFrom,ASC',
          },
          isActive: {
            equalTo: 'true',
          },
          size: {
            equalTo: '20',
          },
        },
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

  stubActiveAlertsFiltered: (prisonerNumber: string) => {
    let jsonResp
    if (prisonerNumber === 'G6123VU') {
      jsonResp = pagedActiveAlertsMockFiltered
    } else if (prisonerNumber === 'A1234BC') {
      jsonResp = emptyAlertsMock
    }
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/${prisonerNumber}/alerts.*`,
        queryParameters: {
          alertType: {
            matches: '.*',
          },
          sort: {
            matches: '.*',
          },
          isActive: {
            equalTo: 'true',
          },
          size: {
            equalTo: '20',
          },
        },
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

  stubInactiveAlerts: (prisonerNumber: string) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/${prisonerNumber}/alerts.*`,
        queryParameters: {
          page: {
            equalTo: '1',
          },
          isActive: {
            equalTo: 'false',
          },
          size: {
            matches: '20',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pagedInactiveAlertsMock,
      },
    })
  },

  stubGetAlertTypes: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/alert-types.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alertTypesMock,
      },
    })
  },

  stubAlertDetails: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/alerts/[\\d|\\w|-]*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alertDetailsMock,
      },
    })
  },

  stubAlertDetailsExpires: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/alerts/[\\d|\\w|-]*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alertDetailsExpiresMock,
      },
    })
  },

  stubCreateAlert: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/alertsApi/alerts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pagedActiveAlertsMock.content[0],
      },
    })
  },

  stubUpdateAlert: () => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/alertsApi/alerts/[\\d|\\w|-]*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pagedActiveAlertsMock.content[0],
      },
    })
  },
}
