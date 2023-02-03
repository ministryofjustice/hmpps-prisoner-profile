import type { Express } from 'express'
import request from 'supertest'
import { miniSummaryParamGroupA, miniSummaryParamGroupB } from '../data/miniSummary/miniSummary'
import { appWithAllRoutes } from '../routes/testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render group a summary cards - box style 1', () => {
    return request(app).get('/prisoner/A8469DY').expect('Content-Type', /html/)
  })
})
