import type { Express } from 'express'
import request from 'supertest'

import { appWithAllRoutes } from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    return request(app).get('/').expect('Location', 'http://localhost:3001').expect(302)
  })

  it('should render index page', () => {
    return request(app).get('/prisoner/A8469DY').expect('Content-Type', /html/)
  })

  it('should render photo page', () => {
    return request(app).get('/prisoner/A8469DY/image').expect('Content-Type', /html/)
  })
})
