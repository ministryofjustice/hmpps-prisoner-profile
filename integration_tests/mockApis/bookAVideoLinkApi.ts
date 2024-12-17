import { stubFor } from './wiremock'

export default {
  stubBookAVideoLinkPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/bookavideolink/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
