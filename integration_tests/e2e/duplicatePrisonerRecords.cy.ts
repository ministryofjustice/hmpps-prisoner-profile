import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import Prisoner from '../../server/data/interfaces/prisonerSearchApi/Prisoner'

const buildDuplicatePrisoners = (
  configs: Array<{
    prisonerNumber: string
    prisonId: string
    firstName?: string
  }>,
): Prisoner[] => {
  return configs.map(config => ({
    ...PrisonerMockDataA,
    prisonerNumber: config.prisonerNumber,
    prisonId: config.prisonId,
    ...(config.firstName && { firstName: config.firstName }),
  }))
}

const visitOverviewPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU' })
}

context('Duplicate Prisoner Records', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
  })

  context('When Person API returns duplicate records', () => {
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

    it('Should load the page successfully with duplicate data', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('not.exist')
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
          { prisonerNumber: 'B5678CD', prisonId: 'LEI', firstName: 'Charlie' },
        ]),
      })
    })

    it('Should filter out ghost establishment records and load successfully', () => {
      visitOverviewPage()
      Page.verifyOnPage(OverviewPage)
      cy.getDataQa('duplicate-prisoner-banner').should('not.exist')
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

    it('Should include both active and inactive duplicates and load successfully', () => {
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
