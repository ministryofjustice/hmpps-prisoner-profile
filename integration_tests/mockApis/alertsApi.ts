import { stubFor } from './wiremock'
import {
  pagedActiveAlertsMock,
  pagedActiveAlertsMockFiltered,
  pagedActiveAlertsMockPage2,
  pagedActiveAlertsMockSorted,
  pagedInactiveAlertsMock,
  unpagedAllAlertsMock,
} from '../../server/data/localMockData/pagedAlertsMock'
import { alertTypesMock } from '../../server/data/localMockData/alertTypesMock'
import { alertDetailsExpiresMock, alertDetailsMock } from '../../server/data/localMockData/alertDetailsMock'

const duplicateAlert = {
  ...alertDetailsExpiresMock,
  prisonNumber: 'G6123VU',
  alertCode: {
    ...alertDetailsExpiresMock.alertCode,
    alertTypeCode: 'A',
    alertTypeDescription: 'AAA',
    code: 'A1',
    description: 'AAA111',
  },
}

export default {
  stubActiveAlerts: (resp = pagedActiveAlertsMock) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/[A-Z0-9]*/alerts.*`,
        queryParameters: {
          sort: {
            matches: '.*',
          },
          isActive: {
            equalTo: 'true',
          },
          size: {
            matches: '(9999|20)',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp,
      },
    })
  },

  stubActiveAlertsPage2: (resp = pagedActiveAlertsMockPage2) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/[A-Z0-9]*/alerts.*`,
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
        jsonBody: resp,
      },
    })
  },

  stubActiveAlertsSorted: (resp = pagedActiveAlertsMockSorted) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/[A-Z0-9]*/alerts.*`,
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
        jsonBody: resp,
      },
    })
  },

  stubActiveAlertsFiltered: (resp = pagedActiveAlertsMockFiltered) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/[A-Z0-9]*/alerts.*`,
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
        jsonBody: resp,
      },
    })
  },

  stubInactiveAlerts: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/[A-Z0-9]*/alerts.*`,
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
        urlPattern: `/alertsApi/prisoners/[A-Z0-9]*/alerts`,
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

  stubCreateAlertConflict: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/alertsApi/prisoners/[A-Z0-9]*/alerts`,
      },
      response: {
        status: 409,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 409, userMessage: 'An active alert already exists' },
      },
    })
  },

  stubDuplicateAlert: () => {
    return Promise.all([
      stubFor({
        request: {
          method: 'GET',
          urlPattern: `/alertsApi/prisoners/[A-Z0-9]*/alerts.*`,
          queryParameters: { isActive: { equalTo: 'true' }, alertCode: { equalTo: 'A1' } },
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: { ...pagedActiveAlertsMock, content: [duplicateAlert] },
        },
      }),
      stubFor({
        request: { method: 'GET', urlPattern: `/alertsApi/alerts/${duplicateAlert.alertUuid}` },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: duplicateAlert,
        },
      }),
    ])
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

  stubGetAlerts: (resp = unpagedAllAlertsMock) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/alertsApi/prisoners/[A-Z0-9]*/alerts.*`,
        queryParameters: {
          size: {
            matches: '(9999|20)',
          },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: resp,
      },
    })
  },
}
