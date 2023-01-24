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
    return request(app)
      .get('/prisoner/111222')
      .expect('Content-Type', /html/)
      .expect(res => {
        miniSummaryParamGroupA.forEach(params => {
          expect(res.text).toContain(params.data.heading)
          expect(res.text).toContain(params.data.linkLabel)
          expect(res.text).toContain(params.data.summaryTopContent)
          expect(params.config.header).toEqual(true)
        })
      })
  })

  it('should render group b summary cards - box style 2', () => {
    return request(app)
      .get('/prisoner/111222')
      .expect('Content-Type', /html/)
      .expect(res => {
        miniSummaryParamGroupB.forEach(params => {
          expect(res.text).toContain('')
          expect(res.text).toContain(params.data.summaryBottomContentType2)
          expect(res.text).toContain(params.data.summaryBottomContentType3)
          expect(params.config.header).toEqual(false)
        })
      })
  })
})
