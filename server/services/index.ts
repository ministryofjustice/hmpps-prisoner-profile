import { dataAccess } from '../data'
import CommonApiRoutes from '../routes/common/api'
import OffenderService from './offenderService'
import PrisonerSearchService from './prisonerSearch'
import UserService from './userService'

export const services = () => {
  const { hmppsAuthClientBuilder, prisonApiClientBuilder } = dataAccess
  const userService = new UserService(hmppsAuthClientBuilder)
  const offenderService = new OffenderService(prisonApiClientBuilder)
  const commonApiRoutes = new CommonApiRoutes(offenderService)

  return {
    commonApiRoutes,
    offenderService,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, CommonApiRoutes }
