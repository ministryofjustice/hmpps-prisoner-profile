import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from './routes/testutils/appSetup'
import PermissionsService from './services/permissionsService'
import { permissionsServiceMock } from '../tests/mocks/permissionsServiceMock'
import { aliasServiceMock } from '../tests/mocks/aliasServiceMock'
import AliasService from './services/aliasService'

jest.mock('./services')

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      dataAccess: {} as any,
      commonApiRoutes: {} as any,
      aliasService: aliasServiceMock() as AliasService,
      permissionsService: permissionsServiceMock() as undefined as PermissionsService,
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
