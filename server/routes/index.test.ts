import type { Express } from 'express'
import request from 'supertest'
import config from '../config'

import { appWithAllRoutes } from './testutils/appSetup'
import { services } from '../services'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: services() })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    return request(app).get('/').expect('Location', config.apis.dpsHomePageUrl).expect(302)
  })

  // I'm not sure we need these given the e2e tests?
  // it('should render index page', () => {
  //   return request(app).get('/prisoner/A8469DY').expect('Content-Type', /html/)
  // })

  // it('should render photo page', () => {
  //   return request(app).get('/prisoner/A8469DY/image').expect('Content-Type', /html/)
  // })
})
