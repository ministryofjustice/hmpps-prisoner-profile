import { dataAccess } from '../data'
import CommonApiRoutes from '../routes/common/api'
import PrisonerSearchService from './prisonerSearch'
import UserService from './userService'

export const services = () => {
  const { hmppsAuthClient } = dataAccess()
  const userService = new UserService(hmppsAuthClient)
  const commonApiRoutes = new CommonApiRoutes()

  return {
    userService,
    commonApiRoutes,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, CommonApiRoutes }
