import type { Express } from 'express'
import request from 'supertest'
import { alerts, profileBannerData, profileBannerTopLinks, tabLinks } from '../data/profileBanner/profileBanner'

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
    return request(app)
      .get('/prisoner/123456')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('<a href="#" class="govuk-back-link govuk-back-link">Back to search results</a>')
      })
  })

  it('should render the back link', () => {
    return request(app)
      .get('/prisoner/123456')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('<span class="hmpps-header__link__sub-text">Manage your details</span>')
      })
  })

  it('should render the profile banner partial', () => {
    return request(app)
      .get('/prisoner/abcdefg')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('<div data-test="hmpps-profile-banner-partial" class="hmpps-profile-banner">')
      })
  })

  it('should render the correct key details', () => {
    return request(app)
      .get('/prisoner/111222')
      .expect('Content-Type', /html/)
      .expect(res => {
        profileBannerTopLinks.forEach(link => {
          expect(res.text).toContain(link.heading)
        })
      })
  })

  it('should render the correct alerts', () => {
    return request(app)
      .get('/prisoner/111222')
      .expect('Content-Type', /html/)
      .expect(res => {
        alerts.forEach(alert => {
          expect(res.text).toContain(alert.label)
        })
      })
  })

  it('should render the tab links', () => {
    return request(app)
      .get('/prisoner/111222')
      .expect('Content-Type', /html/)
      .expect(res => {
        tabLinks.forEach(tabLink => {
          expect(res.text).toContain(tabLink.label)
        })
      })
  })

  it('should render prisoner name and ID', () => {
    return request(app)
      .get('/prisoner/111222')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(profileBannerData.prisonerName)
        expect(res.text).toContain(profileBannerData.prisonId)
      })
  })
})
