import { stubFor } from './wiremock'

const stubBookAVideoLinkApiPing = (httpStatus: number) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/bvl/health/ping',
    },
    response: {
      status: httpStatus,
    },
  })

export default { stubBookAVideoLinkApiPing }
