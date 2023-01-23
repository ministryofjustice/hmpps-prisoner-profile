import { stubFor } from './wiremock'

export default {
  stubDpsOverviewPage: () =>
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
        body: '<html><body><h1>Overview</h1></body></html>',
      },
    }),
}
