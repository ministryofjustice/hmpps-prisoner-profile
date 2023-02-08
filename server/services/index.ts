import { dataAccess } from '../data'
import PageService from './pageService'
import PrisonerSearchService from './prisonerSearch'
import UserService from './userService'

export const services = () => {
  const { hmppsAuthClient } = dataAccess()
  const userService = new UserService(hmppsAuthClient)
  const pageService = new PageService()

  return {
    userService,
    pageService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, PageService }
