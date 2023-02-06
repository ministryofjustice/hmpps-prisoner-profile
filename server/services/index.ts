import { dataAccess, prisonerSearchAccess } from '../data'
import PrisonerSearchService from './prisonerSearch'
import UserService from './userService'

export const services = () => {
  const { hmppsAuthClient } = dataAccess()
  const { prisonerSearchClient } = prisonerSearchAccess()
  const userService = new UserService(hmppsAuthClient)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchClient)

  return {
    userService,
    prisonerSearchService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService }
