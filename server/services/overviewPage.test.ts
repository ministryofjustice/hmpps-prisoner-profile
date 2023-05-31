import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../routes/testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

// Skipped for now - do we need this now we have E2E tests?
describe.skip('GET /', () => {
  it('should render group a summary cards - box style 1', () => {
    return request(app).get('/prisoner/A8469DY').expect('Content-Type', /html/)
  })
})
