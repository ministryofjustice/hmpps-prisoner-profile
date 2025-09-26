import type { Express } from 'express'
import request from 'supertest'
import { DataAccess } from './data'
import CommonApiRoutes from './routes/common/api'
import { appWithAllRoutes } from './routes/testutils/appSetup'
import { aliasServiceMock } from '../tests/mocks/aliasServiceMock'
import AliasService from './services/aliasService'

jest.mock('./services')

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      dataAccess: {} as DataAccess,
      commonApiRoutes: {} as CommonApiRoutes,
      aliasService: aliasServiceMock() as AliasService,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render not found page', () => {
    return request(app)
      .get('/unknown/a')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})
