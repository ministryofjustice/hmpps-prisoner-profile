import { Response } from 'express'
import { Prisoner } from '../interfaces/prisoner'
import { alerts, profileBannerTopLinks, tabLinks } from '../data/profileBanner/profileBanner'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import TokenStore from '../data/tokenStore'
import { createRedisClient } from '../data/redisClient'

export default class PageService {
  renderPage(_res: Response, prisonerNumber: string, template: string, pageData: object) {
    const services = new PrisonerSearchClient(new TokenStore(createRedisClient({ legacyMode: false })))
    services.getPrisonerDetails(_res.locals.user.token, prisonerNumber).then((prisonerData: Prisoner) => {
      const headerData = {
        backLinkLabel: 'Back to search results',
        prisonerName: `${prisonerData.lastName}, ${prisonerData.firstName}`,
        prisonId: prisonerNumber,
        profileBannerTopLinks,
        alerts,
        tabLinks,
      }
      _res.render(template, {
        ...headerData,
        ...pageData,
      })
    })
  }
}
