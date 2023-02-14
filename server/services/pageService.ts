import { Response } from 'express'
import { Prisoner } from '../interfaces/prisoner'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import { mapHeaderData } from '../mappers/headerMappers'

export default class PageService {
  async renderPage<T>(_res: Response, prisonerNumber: string, template: string, pageData: T) {
    const services = new PrisonerSearchClient(_res.locals.user.token)
    const prisonerData: Prisoner = await services.getPrisonerDetails(prisonerNumber)
    _res.render(template, {
      ...mapHeaderData(prisonerData),
      ...pageData,
    })
  }
}
