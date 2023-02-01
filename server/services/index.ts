import { dataAccess, prisonApiAccess } from '../data'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonApiService from './prisonApiService'
import UserService from './userService'

export const services = () => {
  const { hmppsAuthClient } = dataAccess()

  const { prisonApiClient } = prisonApiAccess()

  const userService = new UserService(hmppsAuthClient)
  const prisonApiService = new PrisonApiService(prisonApiClient)

  return {
    userService,
    prisonApiService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonApiService }
