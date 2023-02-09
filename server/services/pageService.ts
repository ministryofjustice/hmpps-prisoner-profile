import { Response } from 'express'
import * as fs from 'fs'
import { Prisoner } from '../interfaces/prisoner'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import { mapHeaderData, placeHolderImagePath } from '../mappers/headerMappers'
import OffenderService from './offenderService'

export default class PageService {
  async renderPage<T>(_res: Response, prisonerNumber: string, template: string, pageData: T) {
    const services = new PrisonerSearchClient(_res.locals.user.token)
    const prisonerData: Prisoner = await services.getPrisonerDetails(prisonerNumber)

    const imagePath = await this.profileImage(prisonerData, _res)
    _res.render(template, {
      ...mapHeaderData(prisonerData, imagePath),
      ...pageData,
    })
  }

  async profileImage(prisonerData: Prisoner, _res: Response): Promise<string> {
    const offenderService = new OffenderService()
    try {
      const image: Buffer = await offenderService.getPrisonerImage(_res.locals.user.token, prisonerData.prisonerNumber)

      const parentDir = `./assets/images/profile`
      const dir = `./assets/images/profile/${prisonerData.prisonerNumber}`
      const imagePath = `/assets/images/profile/${prisonerData.prisonerNumber}/image.png`

      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir)
      }
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }
      if (!fs.existsSync(`.${imagePath}`)) {
        fs.writeFileSync(`.${imagePath}`, image)
      }
      return imagePath
    } catch (err) {
      return placeHolderImagePath
    }
  }
}
