import { dataAccess } from '../data'
import CommonApiRoutes from '../routes/common/api'
import PageService from './pageService'
import PrisonerSearchService from './prisonerSearch'
import UserService from './userService'

export const services = () => {
  const { hmppsAuthClient } = dataAccess()
  const userService = new UserService(hmppsAuthClient)
  const pageService = new PageService()
  const commonApiRoutes = new CommonApiRoutes()

  return {
    userService,
    pageService,
    commonApiRoutes,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, PageService, CommonApiRoutes }
