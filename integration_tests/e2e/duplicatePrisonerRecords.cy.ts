import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import Prisoner from '../../server/data/interfaces/prisonerSearchApi/Prisoner'
import DuplicateProfilesPage from '../pages/duplicateProfilesPage'
import NotFoundPage from '../pages/notFoundPage'
import { Role } from '../../server/data/enums/role'

const buildDuplicatePrisoners = (
  configs: Array<{
    prisonerNumber: string
    prisonId: string
    firstName?: string
    currentFacialImageId?: number
  }>,
): Prisoner[] => {
  return configs.map(config => ({
    ...PrisonerMockDataA,
    prisonerNumber: config.prisonerNumber,
    prisonId: config.prisonId,
    ...(config.firstName && { firstName: config.firstName }),
    ...(config.currentFacialImageId && { currentFacialImageId: config.currentFacialImageId }),
  }))
}

const visitOverviewPage = () => cy.signIn({ redirectPath: '/prisoner/G6123VU' })
const visitDuplicateProfilesPage = ({ failOnStatusCode = true } = {}) =>
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/possible-duplicate-profiles' })

context('Duplicate Prisoner Records', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
  })

  context('When the prisoner is released and the user does not have the INACTIVE_BOOKINGS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
      cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'OUT' } })
      cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
    })

    it('Should display page not found', () => {
      visitDuplicateProfilesPage({ failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('When the prisoner is released and the user has the INACTIVE_BOOKINGS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: ['ROLE_PRISON', Role.InactiveBookings] })
      cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'OUT' } })
      cy.task('stubPersonApiGetRecord', { prisonerNumber, prisonNumbers: [prisonerNumber, 'A1234BC'] })
      cy.task('stubPrisonerSearchFindByNumbers', {
        prisoners: buildDuplicatePrisoners([
          { prisonerNumber, prisonId: 'OUT' },
          { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob' },
        ]),
      })
    })

    it('Should display the duplicate profiles page', () => {
      visitDuplicateProfilesPage({ failOnStatusCode: false })
      Page.verifyOnPage(DuplicateProfilesPage, 'John Saunders')
    })
  })

  context('When the prisoner is transferring and the user does not have the INACTIVE_BOOKINGS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
      cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'TRN' } })
      cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
    })

    it('Should display page not found', () => {
      visitDuplicateProfilesPage({ failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('When the prisoner is transferring and the user has the INACTIVE_BOOKINGS role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: ['ROLE_PRISON', Role.InactiveBookings] })
      cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'TRN' } })
      cy.task('stubPersonApiGetRecord', { prisonerNumber, prisonNumbers: [prisonerNumber, 'A1234BC'] })
      cy.task('stubPrisonerSearchFindByNumbers', {
        prisoners: buildDuplicatePrisoners([
          { prisonerNumber, prisonId: 'TRN' },
          { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob' },
        ]),
      })
    })

    it('Should display the duplicate profiles page', () => {
      visitDuplicateProfilesPage({ failOnStatusCode: false })
      Page.verifyOnPage(DuplicateProfilesPage, 'John Saunders')
    })
  })

  context('When Person API returns duplicate records', () => {
    beforeEach(() => {
      cy.task('stubPersonApiGetRecord', {
        prisonerNumber,
        prisonNumbers: ['G6123VU', 'A1234BC', 'B5678CD'],
      })
      cy.task('stubImages')
      cy.task('stubPrisonerSearchFindByNumbers', {
        prisoners: buildDuplicatePrisoners([
          { prisonerNumber: 'G6123VU', prisonId: 'MDI' },
          { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob', currentFacialImageId: 1234 },
          { prisonerNumber: 'B5678CD', prisonId: 'TRN', firstName: 'Charlie' },
        ]),
      })
    })

    it('Should load the overview page successfully with duplicate data', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('exist')
    })

    it('Should load the duplicate profiles page successfully with duplicate data', () => {
      visitDuplicateProfilesPage()
      const page = Page.verifyOnPage(DuplicateProfilesPage, 'John Saunders')

      page.miniBanner().card().should('be.visible')
      page.miniBanner().name().should('contain.text', 'Saunders, John')
      page.miniBanner().name().should('contain.text', prisonerNumber)

      page.h1().should('contain.text', 'Possible duplicate profiles for John Saunders')

      page.duplicates().should('have.length', 2)

      page.duplicate(0).photo().find('img').should('have.attr', 'src').should('include', '/api/image/1234')
      page.duplicate(0).name().should('contain.text', 'Saunders, Bob (opens in a new tab)')
      page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
      page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
      page.duplicate(0).location().should('contain.text', 'Moorland (HMP & YOI)')

      page
        .duplicate(1)
        .photo()
        .find('img')
        .should('have.attr', 'src')
        .should('include', '/assets/images/prisoner-profile-image.png')
      page.duplicate(1).name().should('contain.text', 'Saunders, Charlie (opens in a new tab)')
      page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
      page.duplicate(1).prisonNumber().should('contain.text', 'B5678CD')
      page.duplicate(1).location().should('contain.text', 'Moorland (HMP & YOI)')
    })
  })

  context('When Person API returns records including any from ghost establishment GHI', () => {
    beforeEach(() => {
      cy.task('stubPersonApiGetRecord', {
        prisonerNumber,
        prisonNumbers: ['G6123VU', 'A1234BC', 'B5678CD'],
      })
      cy.task('stubPrisonerSearchFindByNumbers', {
        prisoners: buildDuplicatePrisoners([
          { prisonerNumber: 'G6123VU', prisonId: 'MDI' },
          { prisonerNumber: 'A1234BC', prisonId: 'GHI', firstName: 'Bob' },
          { prisonerNumber: 'B5678CD', prisonId: 'OUT', firstName: 'Charlie' },
        ]),
      })
    })

    it('Should filter out ghost establishment records and load successfully', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('exist')
    })
  })

  context('When Person API returns multiple active duplicates', () => {
    beforeEach(() => {
      cy.task('stubPersonApiGetRecord', {
        prisonerNumber,
        prisonNumbers: ['G6123VU', 'A1234BC', 'B5678CD'],
      })
      cy.task('stubPrisonerSearchFindByNumbers', {
        prisoners: buildDuplicatePrisoners([
          { prisonerNumber: 'G6123VU', prisonId: 'MDI' },
          { prisonerNumber: 'A1234BC', prisonId: 'LEI', firstName: 'Bob' },
          { prisonerNumber: 'B5678CD', prisonId: 'BXI', firstName: 'Charlie' },
        ]),
      })
    })

    it('Should filter out all duplicates when multiple are active and load successfully', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('not.exist')
    })
  })

  context('When Person API returns one active and one inactive duplicate', () => {
    beforeEach(() => {
      cy.task('stubPersonApiGetRecord', {
        prisonerNumber,
        prisonNumbers: ['G6123VU', 'A1234BC', 'B5678CD'],
      })
      cy.task('stubPrisonerSearchFindByNumbers', {
        prisoners: buildDuplicatePrisoners([
          { prisonerNumber: 'G6123VU', prisonId: 'MDI' },
          { prisonerNumber: 'A1234BC', prisonId: 'LEI', firstName: 'Bob' },
          { prisonerNumber: 'B5678CD', prisonId: 'OUT', firstName: 'Charlie' },
        ]),
      })
    })

    it('Should filter all duplicates when total active count reaches 2 and load successfully', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('not.exist')
    })
  })

  context('When Person API returns no duplicate records', () => {
    beforeEach(() => {
      cy.task('stubPersonApiGetRecord', {
        prisonerNumber,
        prisonNumbers: ['G6123VU'],
      })
      cy.task('stubPrisonerSearchFindByNumbers', {
        prisoners: buildDuplicatePrisoners([{ prisonerNumber: 'G6123VU', prisonId: 'MDI' }]),
      })
    })

    it('Should load successfully with no duplicates', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('not.exist')
    })
  })

  context('When Person API returns 404', () => {
    beforeEach(() => {
      cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
    })

    it('Should handle Person API 404 gracefully and load page', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('not.exist')
    })
  })

  context('When Person API returns 500 error', () => {
    beforeEach(() => {
      cy.task('stubPersonApiGetRecordError', { prisonerNumber })
    })

    it('Should handle Person API error gracefully and load page', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('not.exist')
    })
  })

  context('When Prisoner Search API returns error', () => {
    beforeEach(() => {
      cy.task('stubPersonApiGetRecord', {
        prisonerNumber,
        prisonNumbers: ['G6123VU', 'A1234BC'],
      })
      cy.task('stubPrisonerSearchFindByNumbersError')
    })

    it('Should handle Prisoner Search API error gracefully and load page', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('not.exist')
    })
  })
})
