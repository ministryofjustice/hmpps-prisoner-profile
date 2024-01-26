import { stubFor } from './wiremock'

export default {
  stubDpsHomePage: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/dpshomepage',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: '<html><body><h1>DPS Home page</h1></body></html>',
      },
    }),

  stubDpsAdjudicationsHistoryPage: (prisonerNumber: string) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/dpshomepage/prisoner/${prisonerNumber}/adjudications`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: '<html><body><h1>DPS Adjudications History Page</h1></body></html>',
      },
    }),

  stubDpsConsiderRisksReceptionPage: (prisonerNumber: string) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/dpshomepage/prisoner/${prisonerNumber}/reception-move/consider-risks-reception`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: '<html><body><h1>DPS Consider Risks Reception Page</h1></body></html>',
      },
    }),
}
