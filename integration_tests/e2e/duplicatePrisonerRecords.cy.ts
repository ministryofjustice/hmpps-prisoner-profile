import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import Prisoner from '../../server/data/interfaces/prisonerSearchApi/Prisoner'
import DuplicateProfilesPage from '../pages/duplicateProfilesPage'
import NotFoundPage from '../pages/notFoundPage'
import { Role } from '../../server/data/enums/role'
import { prisonsKeyedByPrisonId } from '../../server/data/localMockData/prisonRegisterMockData'

const specialPrisons: Record<string, { prisonName: string; locationDescription: string }> = {
  OUT: { prisonName: 'Out of Prison', locationDescription: 'Out of Prison' },
  TRN: { prisonName: 'In Transit', locationDescription: 'In Transit' },
}

const buildDuplicatePrisoners = (
  configs: Array<{
    prisonerNumber: string
    prisonId: string
    firstName?: string
    currentFacialImageId?: number
  }>,
): Prisoner[] => {
  return configs.map(config => {
    const prisonInfo =
      specialPrisons[config.prisonId] ||
      (prisonsKeyedByPrisonId[config.prisonId] && {
        prisonName: prisonsKeyedByPrisonId[config.prisonId].prisonName,
        locationDescription: prisonsKeyedByPrisonId[config.prisonId].prisonName,
      })

    return {
      ...PrisonerMockDataA,
      prisonerNumber: config.prisonerNumber,
      prisonId: config.prisonId,
      ...(prisonInfo && {
        prisonName: prisonInfo.prisonName,
        locationDescription: prisonInfo.locationDescription,
      }),
      ...(config.firstName && { firstName: config.firstName }),
      ...(config.currentFacialImageId && { currentFacialImageId: config.currentFacialImageId }),
    }
  })
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
    context('When duplicates include a mix of released and in-transit prisoners', () => {
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
        page.duplicate(0).location().should('contain.text', 'Out of Prison')
        page.duplicate(1).name().should('contain.text', 'Saunders, Charlie')
        page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
        page.duplicate(1).prisonNumber().should('contain.text', 'B5678CD')
        page.duplicate(1).location().should('contain.text', 'In Transit')
      })
    })

    context('When duplicates include a mix of ghost and released/in-transit records', () => {
      beforeEach(() => {
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: ['G6123VU', 'A1234BC', 'B5678CD'],
        })
        cy.task('stubImages')
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber: 'G6123VU', prisonId: 'MDI' },
            { prisonerNumber: 'A1234BC', prisonId: 'GHI', firstName: 'Bob' },
            { prisonerNumber: 'B5678CD', prisonId: 'OUT', firstName: 'Charlie', currentFacialImageId: 1234 },
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
        page.duplicate(0).photo().find('img').should('have.attr', 'src').should('include', '/api/image/1234')
        page.duplicate(0).name().should('contain.text', 'Saunders, Charlie')
        page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
        page.duplicate(0).prisonNumber().should('contain.text', 'B5678CD')
        page.duplicate(0).location().should('contain.text', 'Out of Prison')
        page.duplicate(1).name().should('contain.text', 'Saunders, Dave')
        page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/C9999EF')
        page.duplicate(1).prisonNumber().should('contain.text', 'C9999EF')
        page.duplicate(1).location().should('contain.text', 'In Transit')
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

    context('When duplicates include a mix of ghost and active records', () => {
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
        verifyNotFoundOnDuplicatesPage()
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

    context('When a user views duplicates for an active record where all duplicates are released', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth()
        cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: [prisonerNumber, 'A1234BC', 'B5678CD'],
        })
        cy.task('stubImages')
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber, prisonId: 'MDI' },
            { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob', currentFacialImageId: 1234 },
            { prisonerNumber: 'B5678CD', prisonId: 'OUT', firstName: 'Charlie' },
          ]),
        })
      })

      it('Should show the duplicates page with the non-filtered list of records', () => {
        const page = visitAndVerifyDuplicateProfilesPage()
        page.duplicates().should('have.length', 2)
        page.duplicate(0).photo().find('img').should('have.attr', 'src').should('include', '/api/image/1234')
        page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
        page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
        page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        page.duplicate(0).location().should('contain.text', 'Out of Prison')
        page.duplicate(1).name().should('contain.text', 'Saunders, Charlie')
        page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
        page.duplicate(1).prisonNumber().should('contain.text', 'B5678CD')
        page.duplicate(1).location().should('contain.text', 'Out of Prison')
      })
    })

    context('When a user views duplicates for an active record where all duplicates are in-transit', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth()
        cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: [prisonerNumber, 'A1234BC', 'B5678CD'],
        })
        cy.task('stubImages')
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber, prisonId: 'MDI' },
            { prisonerNumber: 'A1234BC', prisonId: 'TRN', firstName: 'Bob', currentFacialImageId: 1234 },
            { prisonerNumber: 'B5678CD', prisonId: 'TRN', firstName: 'Charlie' },
          ]),
        })
      })

      it('Should show the duplicates page with the non-filtered list of records', () => {
        const page = visitAndVerifyDuplicateProfilesPage()
        page.duplicates().should('have.length', 2)
        page.duplicate(0).photo().find('img').should('have.attr', 'src').should('include', '/api/image/1234')
        page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
        page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
        page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
        page.duplicate(0).location().should('contain.text', 'In Transit')
        page.duplicate(1).name().should('contain.text', 'Saunders, Charlie')
        page.duplicate(1).name().find('a').should('have.attr', 'href').should('include', '/prisoner/B5678CD')
        page.duplicate(1).prisonNumber().should('contain.text', 'B5678CD')
        page.duplicate(1).location().should('contain.text', 'In Transit')
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
          cy.task('stubImages')
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'OUT' },
              { prisonerNumber: 'A1234BC', prisonId: 'MDI', firstName: 'Bob', currentFacialImageId: 1234 },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).photo().find('img').should('have.attr', 'src').should('include', '/api/image/1234')
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
          page.duplicate(0).location().should('contain.text', 'Moorland')
        })
      },
    )

    context(
      'When a user with INACTIVE_BOOKINGS views duplicates for an in-transit prisoner where duplicates include an active prisoner in their caseload',
      () => {
        beforeEach(() => {
          cy.task('reset')
          cy.setupUserAuth({ roles: [Role.PrisonUser, Role.InactiveBookings] })
          cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'TRN' } })
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC'],
          })
          cy.task('stubImages')
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'TRN' },
              { prisonerNumber: 'A1234BC', prisonId: 'MDI', firstName: 'Bob', currentFacialImageId: 1234 },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).photo().find('img').should('have.attr', 'src').should('include', '/api/image/1234')
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
          page.duplicate(0).location().should('contain.text', 'Moorland')
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
          cy.task('stubImages')
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'OUT' },
              { prisonerNumber: 'A1234BC', prisonId: 'LEI', firstName: 'Bob', currentFacialImageId: 1234 },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).photo().find('img').should('have.attr', 'src', '/assets/images/prisoner-profile-image.png')
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
          page.duplicate(0).location().should('contain.text', 'Leeds')
        })
      },
    )

    context(
      'When a user with GLOBAL_SEARCH and INACTIVE_BOOKINGS views duplicates for an in-transit prisoner where duplicates include an active prisoner not in their caseload',
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
          cy.task('stubImages')
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'TRN' },
              { prisonerNumber: 'A1234BC', prisonId: 'LEI', firstName: 'Bob', currentFacialImageId: 1234 },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).photo().find('img').should('have.attr', 'src', '/assets/images/prisoner-profile-image.png')
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
          page.duplicate(0).location().should('contain.text', 'Leeds')
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
          cy.setupComponentsData()
          cy.task('stubImages')
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC'],
          })
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'OUT' },
              { prisonerNumber: 'A1234BC', prisonId: 'LEI', firstName: 'Bob', currentFacialImageId: 1234 },
            ]),
          })
        })

        it('Should show the duplicates page with limited details for the out-of-caseload duplicate', () => {
          visitDuplicateProfilesPage({ failOnStatusCode: false })
          const page = Page.verifyOnPage(DuplicateProfilesPage, 'John Saunders')
          page.duplicates().should('have.length', 1)
          page.duplicate(0).photo().find('img').should('have.attr', 'src', '/assets/images/prisoner-profile-image.png')
          page.duplicate(0).name().should('be.empty')
          page.duplicate(0).name().find('a').should('not.exist')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
          page.duplicate(0).location().should('contain.text', 'Leeds')
        })
      },
    )

    context(
      'When a user with INACTIVE_BOOKINGS views duplicates for an in-transit prisoner where duplicates include an active prisoner not in their caseload',
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
          cy.setupComponentsData()
          cy.task('stubImages')
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC'],
          })
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'TRN' },
              { prisonerNumber: 'A1234BC', prisonId: 'LEI', firstName: 'Bob', currentFacialImageId: 1234 },
            ]),
          })
        })

        it('Should show the duplicates page with limited details for the out-of-caseload duplicate', () => {
          visitDuplicateProfilesPage({ failOnStatusCode: false })
          const page = Page.verifyOnPage(DuplicateProfilesPage, 'John Saunders')
          page.duplicates().should('have.length', 1)
          page.duplicate(0).photo().find('img').should('have.attr', 'src', '/assets/images/prisoner-profile-image.png')
          page.duplicate(0).name().should('be.empty')
          page.duplicate(0).name().find('a').should('not.exist')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
          page.duplicate(0).location().should('contain.text', 'Leeds')
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
          cy.task('stubImages')
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'LEI' },
              { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob', currentFacialImageId: 1234 },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered single record', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 1)
          page.duplicate(0).photo().find('img').should('have.attr', 'src', '/assets/images/prisoner-profile-image.png')
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
          page.duplicate(0).location().should('contain.text', 'Out of Prison')
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
          cy.task('stubImages')
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'OUT' },
              { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob', currentFacialImageId: 1234 },
              { prisonerNumber: 'B5678CD', prisonId: 'OUT', firstName: 'Charlie' },
            ]),
          })
        })

        it('Should show the duplicates page with the non-filtered list of records', () => {
          const page = visitAndVerifyDuplicateProfilesPage({ failOnStatusCode: false })
          page.duplicates().should('have.length', 2)
          page.duplicate(0).photo().find('img').should('have.attr', 'src').should('include', '/api/image/1234')
          page.duplicate(0).name().should('contain.text', 'Saunders, Bob')
          page.duplicate(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          page.duplicate(0).prisonNumber().should('contain.text', 'A1234BC')
          page.duplicate(0).location().should('contain.text', 'Out of Prison')
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
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: [prisonerNumber, 'A1234BC'],
        })
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber, prisonId: 'OUT' },
            { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob' },
          ]),
        })
      })

      it('Should return NOT FOUND on the duplicates page due to insufficient roles', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context('When a user with only ROLE_PRISON views duplicates for an in-transit prisoner', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [Role.PrisonUser] })
        cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId: 'TRN' } })
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: [prisonerNumber, 'A1234BC'],
        })
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber, prisonId: 'TRN' },
            { prisonerNumber: 'A1234BC', prisonId: 'TRN', firstName: 'Bob' },
          ]),
        })
      })

      it('Should return NOT FOUND on the duplicates page due to insufficient roles', () => {
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

      it('Should return NOT FOUND on the duplicates page due to insufficient roles', () => {
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
        cy.task('stubPersonApiGetRecord', {
          prisonerNumber,
          prisonNumbers: [prisonerNumber, 'A1234BC'],
        })
        cy.task('stubPrisonerSearchFindByNumbers', {
          prisoners: buildDuplicatePrisoners([
            { prisonerNumber, prisonId: 'OUT' },
            { prisonerNumber: 'A1234BC', prisonId: 'OUT', firstName: 'Bob' },
          ]),
        })
      })

      it('Should return NOT FOUND on the duplicates page due to insufficient roles', () => {
        verifyNotFoundOnDuplicatesPage()
      })
    })

    context(
      'When a user with only ROLE_PRISON views duplicates for an in-transit prisoner not in their caseload',
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
          cy.task('stubPersonApiGetRecord', {
            prisonerNumber,
            prisonNumbers: [prisonerNumber, 'A1234BC'],
          })
          cy.task('stubPrisonerSearchFindByNumbers', {
            prisoners: buildDuplicatePrisoners([
              { prisonerNumber, prisonId: 'TRN' },
              { prisonerNumber: 'A1234BC', prisonId: 'TRN', firstName: 'Bob' },
            ]),
          })
        })

        it('Should return NOT FOUND on the duplicates page due to insufficient roles', () => {
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

        it('Should return NOT FOUND on the duplicates page due to insufficient roles', () => {
          verifyNotFoundOnDuplicatesPage()
        })
      },
    )
  })
})
