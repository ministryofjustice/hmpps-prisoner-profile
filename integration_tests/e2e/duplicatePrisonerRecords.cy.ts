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

const nonMdiCaseLoad = [{ caseLoadId: 'ZZZ', currentlyActive: true, description: '', type: '', caseloadFunction: '' }]

const verifyBannerOnOverviewPage = (bannerStatus: string) => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU' })
  Page.verifyOnPage(OverviewPage)
  cy.getDataQa('duplicate-prisoner-banner').should(`${bannerStatus}`)
}

const visitDuplicateProfilesPage = ({ failOnStatusCode = true } = {}) =>
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/possible-duplicate-profiles' })

const visitAndVerifyDuplicateProfilesPage = ({ failOnStatusCode = true } = {}) => {
  visitDuplicateProfilesPage({ failOnStatusCode })
  const page = Page.verifyOnPage(DuplicateProfilesPage, 'John Saunders')
  page.miniBanner().card().should('be.visible')
  page.miniBanner().name().should('contain.text', 'Saunders, John')
  page.miniBanner().name().should('contain.text', 'G6123VU')
  page.h1().should('contain.text', 'Possible duplicate profiles for John Saunders')
  cy.get('[data-qa="back-link"]').should('have.attr', 'href').should('include', `/prisoner/G6123VU`)
  return page
}

const verifyNotFoundOnDuplicatesPage = () => {
  visitDuplicateProfilesPage({ failOnStatusCode: false })
  Page.verifyOnPage(NotFoundPage)
}

context('Duplicate Prisoner Records', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
  })

  context('Duplicates page content', () => {
    context('When duplicates include a mix of released and transferring prisoners', () => {
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

      it('Should show the overview page with the duplicate banner', () => {
        verifyBannerOnOverviewPage('exist')
      })

      it('Should show the duplicates page with the non-filtered list of records', () => {
        const page = visitAndVerifyDuplicateProfilesPage()
        page.duplicates().should('have.length', 2)
        page.duplicate(0).photo().find('img').should('have.attr', 'src').should('include', '/api/image/1234')
        page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
        page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
        page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        page.duplicate(1).name().should('contain.text', 'Saunders, Charlie')
        page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
        page.duplicate(1).prisonNumber().should('contain.text', 'B5678CD')
      })
    })

    context('When duplicates include a mix of ghost and released/transferring records', () => {
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
            { prisonerNumber: 'C9999EF', prisonId: 'TRN', firstName: 'Dave' },
          ]),
        })
      })

      it('Should show the overview page with the duplicates banner', () => {
        verifyBannerOnOverviewPage('exist')
      })

      it('Should show the duplicates page with the filtered list of non-ghost duplicates', () => {
        const page = visitAndVerifyDuplicateProfilesPage()
        page.duplicates().should('have.length', 2)
        page.duplicate(0).name().should('contain.text', 'Saunders, Charlie')
        page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
        page.duplicate(0).prisonNumber().should('contain.text', 'B5678CD')
        page.duplicate(1).name().should('contain.text', 'Saunders, Dave')
        page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/C9999EF')
        page.duplicate(1).prisonNumber().should('contain.text', 'C9999EF')
      })
    })

    context('When duplicates only include a ghost record', () => {
      beforeEach(() => {
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: ['G6123VU', 'A1234BC'],
        })
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber: 'G6123VU', prisonId: 'MDI' },
            { prisonerNumber: 'A1234BC', prisonId: 'GHI', firstName: 'Bob' },
          ]),
        })
      })

      it('Should show the overview page without the duplicates banner', () => {
        verifyBannerOnOverviewPage('not.exist')
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When duplicates only include multiple ghost records', () => {
      beforeEach(() => {
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: ['G6123VU', 'A1234BC', 'B5678CD'],
        })
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber: 'G6123VU', prisonId: 'MDI' },
            { prisonerNumber: 'A1234BC', prisonId: 'GHI', firstName: 'Bob' },
            { prisonerNumber: 'B5678CD', prisonId: 'GHI', firstName: 'Charlie' },
          ]),
        })
      })

      it('Should show the overview page without the duplicates banner', () => {
        verifyBannerOnOverviewPage('not.exist')
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When duplicates include multiple active records at different establishments', () => {
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

      it('Should show the overview page without the duplicates banner', () => {
        verifyBannerOnOverviewPage('not.exist')
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When duplicates include an active record at the same establishment', () => {
      beforeEach(() => {
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: ['G6123VU', 'A1234BC'],
        })
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber: 'G6123VU', prisonId: 'MDI' },
            { prisonerNumber: 'A1234BC', prisonId: 'MDI', firstName: 'Bob' },
          ]),
        })
      })

      it('Should show the overview page without the duplicates banner', () => {
        verifyBannerOnOverviewPage('not.exist')
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When duplicates include one active and one inactive record', () => {
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

      it('Should show the overview page without the duplicates banner', () => {
        verifyBannerOnOverviewPage('not.exist')
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })
  })

  context('When duplicates include a mix of GHI and active records', () => {
    beforeEach(() => {
      cy.task('stubPersonApiGetRecord', {
        prisonerNumber,
        prisonNumbers: ['G6123VU', 'A1234BC', 'B5678CD', 'C9999EF'],
      })
      cy.task('stubPrisonerSearchFindByNumbers', {
        prisoners: buildDuplicatePrisoners([
          { prisonerNumber: 'G6123VU', prisonId: 'MDI' },
          { prisonerNumber: 'A1234BC', prisonId: 'GHI', firstName: 'Bob' },
          { prisonerNumber: 'B5678CD', prisonId: 'LEI', firstName: 'Charlie' },
          { prisonerNumber: 'C9999EF', prisonId: 'OUT', firstName: 'Dave' },
        ]),
      })
    })

    it('Should show the overview page without the duplicates banner', () => {
      verifyBannerOnOverviewPage('not.exist')
    })

    it('Should return NOT FOUND on the duplicates page', () => {
      verifyNotFoundOnDuplicatesPage()
    })

    context('When no duplicate records exist', () => {
      beforeEach(() => {
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: ['G6123VU'],
        })
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([{ prisonerNumber: 'G6123VU', prisonId: 'MDI' }]),
        })
      })

      it('Should show the overview page without the duplicates banner', () => {
        verifyBannerOnOverviewPage('not.exist')
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When Person API returns 404', () => {
      beforeEach(() => {
        cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
      })

      it('Should show the overview page without the duplicates banner', () => {
        verifyBannerOnOverviewPage('not.exist')
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When Person API returns 500', () => {
      beforeEach(() => {
        cy.task('stubPersonApiGetRecordError', { prisonerNumber })
      })

      it('Should show the overview page without the duplicates banner', () => {
        verifyBannerOnOverviewPage('not.exist')
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        visitDuplicateProfilesPage({ failOnStatusCode: false })
        Page.verifyOnPage(NotFoundPage)
      })
    })

    context('When Prisoner Search API returns an error', () => {
      beforeEach(() => {
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: ['G6123VU', 'A1234BC'],
        })
        cy.task('stubPrisonerSearchFindByNumbersError')
      })

      it('Should show the overview page without the duplicates banner', () => {
        verifyBannerOnOverviewPage('not.exist')
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When a user views duplicates for an active record where all duplicates are OUT', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth()
        cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: [prisonerNumber, 'A1234BC', 'B5678CD'],
        })
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber, prisonId: 'MDI' },
            { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob' },
            { prisonerNumber: 'B5678CD', prisonId: 'OUT', firstName: 'Charlie' },
          ]),
        })
      })

      it('Should show the duplicates page with the non-filtered list of records', () => {
        const page = visitAndVerifyDuplicateProfilesPage()
        page.duplicates().should('have.length', 2)
        page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
        page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
        page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        page.duplicate(1).name().should('contain.text', 'Saunders, Charlie')
        page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
        page.duplicate(1).prisonNumber().should('contain.text', 'B5678CD')
      })
    })

    context('When a user views duplicates for an active record where all duplicates are TRN', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth()
        cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: [prisonerNumber, 'A1234BC', 'B5678CD'],
        })
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber, prisonId: 'MDI' },
            { prisonerNumber: 'A1234BC', prisonId: 'TRN', firstName: 'Bob' },
            { prisonerNumber: 'B5678CD', prisonId: 'TRN', firstName: 'Charlie' },
          ]),
        })
      })

      it('Should show the duplicates page with the non-filtered list of records', () => {
        const page = visitAndVerifyDuplicateProfilesPage()
        page.duplicates().should('have.length', 2)
        page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
        page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
        page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        page.duplicate(1).name().should('contain.text', 'Saunders, Charlie')
        page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
        page.duplicate(1).prisonNumber().should('contain.text', 'B5678CD')
      })
    })

    context(
      'When a user with INACTIVE_BOOKINGS views duplicates for a released prisoner where duplicates include an active prisoner in their caseload',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.InactiveBookings] })
          cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'OUT' } })
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC'],
          })
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'OUT' },
              { prisonerNumber: 'A1234BC', prisonId: 'MDI', firstName: 'Bob' },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        })
      },
    )

    context(
      'When a user with INACTIVE_BOOKINGS views duplicates for a transferring prisoner where duplicates include an active prisoner in their caseload',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.InactiveBookings] })
          cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'TRN' } })
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC'],
          })
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'TRN' },
              { prisonerNumber: 'A1234BC', prisonId: 'MDI', firstName: 'Bob' },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        })
      },
    )

    context(
      'When a user with GLOBAL_SEARCH and INACTIVE_BOOKINGS views duplicates for a released prisoner where duplicates include an active prisoner not in their caseload',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.InactiveBookings, Role.GlobalSearch] })
          cy.setupOverviewPageStubs({
            prisonerNumber,
            bookingId,
            prisonerDataOverrides: { prisonId: 'OUT' },
            caseLoads: nonMdiCaseLoad,
          })
          cy.setupComponentsData()
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC'],
          })
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'OUT' },
              { prisonerNumber: 'A1234BC', prisonId: 'LEI', firstName: 'Bob' },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        })
      },
    )

    context(
      'When a user with GLOBAL_SEARCH and INACTIVE_BOOKINGS views duplicates for a transferring prisoner where duplicates include an active prisoner not in their caseload',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.InactiveBookings, Role.GlobalSearch] })
          cy.setupOverviewPageStubs({
            prisonerNumber,
            bookingId,
            prisonerDataOverrides: { prisonId: 'TRN' },
            caseLoads: nonMdiCaseLoad,
          })
          cy.setupComponentsData()
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC'],
          })
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'TRN' },
              { prisonerNumber: 'A1234BC', prisonId: 'LEI', firstName: 'Bob' },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        })
      },
    )

    context(
      'When a user with INACTIVE_BOOKINGS views duplicates for a released prisoner where duplicates include an active prisoner not in their caseload',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.InactiveBookings] })
          cy.setupOverviewPageStubs({
            prisonerNumber,
            bookingId,
            prisonerDataOverrides: { prisonId: 'OUT' },
            caseLoads: nonMdiCaseLoad,
          })
          cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
        })

        it('Should return NOT FOUND on the duplicates page', () => {
          verifyNotFoundOnDuplicatesPage()
        })
      },
    )

    context(
      'When a user with INACTIVE_BOOKINGS views duplicates for a transferring prisoner where duplicates include an active prisoner not in their caseload',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.InactiveBookings] })
          cy.setupOverviewPageStubs({
            prisonerNumber,
            bookingId,
            prisonerDataOverrides: { prisonId: 'TRN' },
            caseLoads: nonMdiCaseLoad,
          })
          cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
        })

        it('Should return NOT FOUND on the duplicates page', () => {
          verifyNotFoundOnDuplicatesPage()
        })
      },
    )

    context(
      'When a user with GLOBAL_SEARCH views duplicates for an active prisoner at another establishment not in their caseload',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.GlobalSearch] })
          cy.setupOverviewPageStubs({
            prisonerNumber,
            bookingId,
            prisonerDataOverrides: { prisonId: 'LEI' },
            caseLoads: nonMdiCaseLoad,
          })
          cy.setupComponentsData()
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC'],
          })
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'LEI' },
              { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob' },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        })
      },
    )

    context(
      'When a user with INACTIVE_BOOKINGS views duplicates for a released prisoner where all duplicates are also released',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.InactiveBookings] })
          cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'OUT' } })
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC', 'B5678CD'],
          })
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'OUT' },
              { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob' },
              { prisonerNumber: 'B5678CD', prisonId: 'OUT', firstName: 'Charlie' },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered list of records', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 2)
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
          page.duplicate(1).name().should('contain.text', 'Saunders, Charlie')
          page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
          page.duplicate(1).prisonNumber().should('contain.text', 'B5678CD')
        })
      },
    )

    context('When a user with only ROLE_PRISON views duplicates for a released prisoner', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [Role.PrisonUser] })
        cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'OUT' } })
        cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
      })

      it('Should return NOT FOUND', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When a user with only ROLE_PRISON views duplicates for a transferring prisoner', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [Role.PrisonUser] })
        cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'TRN' } })
        cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
      })

      it('Should return NOT FOUND', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When a user with only ROLE_PRISON views duplicates for an active prisoner not in their caseload', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [Role.PrisonUser] })
        cy.setupOverviewPageStubs({
          prisonerNumber,
          bookingId,
          prisonerDataOverrides: { prisonId: 'LEI' },
          caseLoads: nonMdiCaseLoad,
        })
        cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When a user with only ROLE_PRISON views duplicates for a released prisoner not in their caseload', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [Role.PrisonUser] })
        cy.setupOverviewPageStubs({
          prisonerNumber,
          bookingId,
          prisonerDataOverrides: { prisonId: 'OUT' },
          caseLoads: nonMdiCaseLoad,
        })
        cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
      })

      it('Should return NOT FOUND on the duplicates page', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context(
      'When a user with only ROLE_PRISON views duplicates for a transferring prisoner not in their caseload',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser] })
          cy.setupOverviewPageStubs({
            prisonerNumber,
            bookingId,
            prisonerDataOverrides: { prisonId: 'TRN' },
            caseLoads: nonMdiCaseLoad,
          })
          cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
        })

        it('Should return NOT FOUND on the duplicates page', () => {
          verifyNotFoundOnDuplicatesPage()
        })
      },
    )

    context(
      'When a user with INACTIVE_BOOKINGS views duplicates for an active prisoner not in their caseload where duplicates include a released prisoner',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.InactiveBookings] })
          cy.setupOverviewPageStubs({
            prisonerNumber,
            bookingId,
            prisonerDataOverrides: { prisonId: 'LEI' },
            caseLoads: nonMdiCaseLoad,
          })
          cy.task('stubPersonApiGetRecordNotFound', { prisonerNumber })
        })

        it('Should return NOT FOUND on the duplicates page', () => {
          verifyNotFoundOnDuplicatesPage()
        })
      },
    )
  })
})
