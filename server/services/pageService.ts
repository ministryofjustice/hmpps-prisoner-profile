import { Response } from 'express'
import { Prisoner } from '../interfaces/prisoner'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import TokenStore from '../data/tokenStore'
import { createRedisClient } from '../data/redisClient'
import { mapHeaderData } from '../mappers/headerMappers'

export default class PageService {
  renderPage<T>(_res: Response, prisonerNumber: string, template: string, pageData: T) {
    const services = new PrisonerSearchClient(new TokenStore(createRedisClient({ legacyMode: false })))
    services.getPrisonerDetails(_res.locals.user.token, prisonerNumber).then((prisonerData: Prisoner) => {
      _res.render(template, {
        ...mapHeaderData(prisonerData),
        ...pageData,
      })
    })
  }
}
