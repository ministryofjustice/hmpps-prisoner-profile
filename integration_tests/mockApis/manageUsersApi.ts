import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'
import type { PrisonUser } from '../../server/data/interfaces/manageUsersApi'
import { mockPrisonUser } from '../../server/data/localMockData/manageUsersMock'

export default {
  stubManageUsersApiPing: (httpStatus = 200): SuperAgentRequest => stubPing('/manageUsers', httpStatus),

  stubManageUsersGetPrisonUser: ({ user = mockPrisonUser }: { user?: PrisonUser }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/manageUsers/prisonusers/${user.username}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: user,
      },
    }),
}
