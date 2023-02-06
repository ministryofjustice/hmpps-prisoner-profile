import { dataAccess, prisonerSearchAccess } from '../data'
import PageService from './pageService'
import PrisonerSearchService from './prisonerSearch'
import UserService from './userService'

export const services = () => {
  const { hmppsAuthClient } = dataAccess()
  const { prisonerSearchClient } = prisonerSearchAccess()
  const userService = new UserService(hmppsAuthClient)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchClient)
  const pageService = new PageService()

  return {
    userService,
    prisonerSearchService,
    pageService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, PageService }
