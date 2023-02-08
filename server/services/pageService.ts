import { Response } from 'express'
import { Prisoner } from '../interfaces/prisoner'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import { mapHeaderData, placeHolderImagePath, subStr } from '../mappers/headerMappers'
import OffenderService from './offenderService'

export default class PageService {
  async renderPage<T>(_res: Response, prisonerNumber: string, template: string, pageData: T) {
    const services = new PrisonerSearchClient(_res.locals.user.token)
    const prisonerData: Prisoner = await services.getPrisonerDetails(prisonerNumber)

    let imagePath: string
    if (_res.req.rawHeaders[1].includes(subStr)) {
      imagePath = placeHolderImagePath
    } else {
      imagePath = await this.profileImage(prisonerData, _res)
    }

    _res.render(template, {
      ...mapHeaderData(prisonerData, imagePath),
      ...pageData,
    })
  }

  async profileImage(prisonerData: Prisoner, _res: Response): Promise<string> {
    const offenderService = new OffenderService()
    try {
      await offenderService.getPrisonerImage(_res.locals.user.token, prisonerData.prisonerNumber)
      return `/app/images/${prisonerData.prisonerNumber}/data`
    } catch (err) {
      return placeHolderImagePath
    }
  }
}
