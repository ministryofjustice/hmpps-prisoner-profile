import { Response } from 'express'
import { Prisoner } from '../interfaces/prisoner'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import { mapHeaderData } from '../mappers/headerMappers'
import { PageConfig } from '../interfaces/pageConfig'

export default class PageService {
  async renderPage<T>(
    _res: Response,
    prisonerNumber: string,
    template: string,
    pageData: T,
    pageConfig: PageConfig,
    pageBodyNjk: string,
  ) {
    const services = new PrisonerSearchClient(_res.locals.user.token)
    const prisonerData: Prisoner = await services.getPrisonerDetails(prisonerNumber)
    _res.render(template, {
      ...mapHeaderData(prisonerData),
      ...pageData,
      ...pageConfig,
      pageBodyNjk,
    })
  }
}
