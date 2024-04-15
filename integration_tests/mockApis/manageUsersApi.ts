import { Response } from 'superagent'

import { stubFor } from './wiremock'

const stubUser = (name: string, activeCaseLoadId?: string) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/manageUsers/users/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        staffId: 231232,
        username: 'USER1',
        active: true,
        activeCaseLoadId,
        name,
      },
    },
  })

export default {
  stubUser: ({ name = 'john smith', activeCaseLoadId = undefined } = {}): Promise<[Response]> =>
    Promise.all([stubUser(name, activeCaseLoadId)]),
}
