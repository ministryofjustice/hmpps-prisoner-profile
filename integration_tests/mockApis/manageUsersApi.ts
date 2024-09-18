import { stubFor } from './wiremock'

const stubManageUsersApiPing = (httpStatus: number) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/manageUsers/health/ping',
    },
    response: {
      status: httpStatus,
    },
  })

export default { stubManageUsersApiPing }
