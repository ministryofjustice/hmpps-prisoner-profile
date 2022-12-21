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
}
