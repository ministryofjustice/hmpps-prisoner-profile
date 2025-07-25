import Prisoner from '../../server/data/interfaces/prisonerSearchApi/Prisoner'
import { Role } from '../../server/data/enums/role'
import NotFoundPage from '../pages/notFoundPage'
import Page from '../pages/page'

export function permissionsTests<TPage extends Page>({
  prisonerNumber,
  visitPage,
  pageToDisplay,
  pageWithTitleToDisplay,
  options = {
    additionalRoles: [],
    preventGlobalSearchAccessOfOtherCaseloads: false,
    preventGlobalSearchAccessOfTransferringPrisoners: false,
  },
}: {
  prisonerNumber: string
  visitPage: (prisonerDataOverrides: Partial<Prisoner>) => void
  pageToDisplay?: new () => TPage
  pageWithTitleToDisplay?: { page: new (title: string) => TPage; title: string }
  options?: {
    additionalRoles: Role[]
    preventGlobalSearchAccessOfOtherCaseloads?: boolean
    preventGlobalSearchAccessOfTransferringPrisoners?: boolean
  }
}) {
  const verifyPageDisplayed = () => {
    if (pageToDisplay) {
      Page.verifyOnPage(pageToDisplay)
    }
    if (pageWithTitleToDisplay) {
      Page.verifyOnPageWithTitle(pageWithTitleToDisplay.page, pageWithTitleToDisplay.title)
    }
  }

  beforeEach(() => {
    cy.task('reset')
  })

  context('The prisoner is outside the users case load', () => {
    context('The user has no special roles', () => {
      const overrides: Partial<Prisoner> = { prisonId: 'ABC' }

      beforeEach(() => {
        cy.setupUserAuth({ roles: [Role.PrisonUser, ...options.additionalRoles] })
        cy.setupComponentsData({
          caseLoads: [
            {
              caseloadFunction: '',
              caseLoadId: 'ZZZ',
              currentlyActive: true,
              description: '',
              type: '',
            },
          ],
        })
        cy.task('stubPrisonerData', { prisonerNumber, overrides })
      })

      it('Displays Page Not Found', () => {
        visitPage(overrides)
        new NotFoundPage().shouldBeDisplayed()
      })
    })

    context('The user has the GLOBAL_SEARCH role', () => {
      const overrides: Partial<Prisoner> = { prisonId: 'ABC' }
      beforeEach(() => {
        cy.setupUserAuth({ roles: [Role.PrisonUser, Role.GlobalSearch, ...options.additionalRoles] })
        cy.setupComponentsData({
          caseLoads: [
            {
              caseloadFunction: '',
              caseLoadId: 'ZZZ',
              currentlyActive: true,
              description: '',
              type: '',
            },
          ],
        })
        cy.task('stubPrisonerData', { prisonerNumber, overrides })
      })

      if (options?.preventGlobalSearchAccessOfOtherCaseloads) {
        it('Does not display the page', () => {
          visitPage(overrides)
          new NotFoundPage().shouldBeDisplayed()
        })
      } else {
        it('Displays the page', () => {
          visitPage(overrides)
          verifyPageDisplayed()
        })
      }
    })
  })

  context('The prisoner is released', () => {
    const overrides: Partial<Prisoner> = { prisonId: 'OUT' }
    beforeEach(() => {
      cy.task('stubPrisonerData', { prisonerNumber, overrides })
    })

    context('The user does not have the INACTIVE_BOOKINGS role', () => {
      beforeEach(() => {
        cy.setupUserAuth({ roles: ['ROLE_PRISON', ...options.additionalRoles] })
      })

      it('Displays page not found', () => {
        visitPage(overrides)
        new NotFoundPage().shouldBeDisplayed()
      })
    })

    context('The user has the INACTIVE_BOOKINGS role', () => {
      beforeEach(() => {
        cy.setupUserAuth({ roles: ['ROLE_PRISON', Role.InactiveBookings, ...options.additionalRoles] })
        cy.setupComponentsData()
      })

      it('Displays the page', () => {
        visitPage(overrides)
        verifyPageDisplayed()
      })
    })
  })

  context('The prisoner is transferring', () => {
    const overrides: Partial<Prisoner> = { prisonId: 'TRN' }
    beforeEach(() => {
      cy.task('stubPrisonerData', { prisonerNumber, overrides })
    })

    context('The user does not have the INACTIVE_BOOKINGS role', () => {
      beforeEach(() => {
        cy.setupUserAuth({ roles: ['ROLE_PRISON', ...options.additionalRoles] })
        cy.setupComponentsData()
      })

      it('Displays page not found', () => {
        visitPage(overrides)
        new NotFoundPage().shouldBeDisplayed()
      })
    })

    context('The user has the INACTIVE_BOOKINGS role', () => {
      beforeEach(() => {
        cy.setupUserAuth({ roles: ['ROLE_PRISON', Role.InactiveBookings, ...options.additionalRoles] })
        cy.setupComponentsData()
      })

      it('Displays the page', () => {
        visitPage(overrides)
        verifyPageDisplayed()
      })
    })

    context('The user has the GLOBAL_SEARCH role', () => {
      beforeEach(() => {
        cy.setupUserAuth({ roles: ['ROLE_PRISON', Role.GlobalSearch, ...options.additionalRoles] })
        cy.setupComponentsData()
      })

      if (options?.preventGlobalSearchAccessOfTransferringPrisoners) {
        it('Does not display the page', () => {
          visitPage(overrides)
          new NotFoundPage().shouldBeDisplayed()
        })
      } else {
        it('Displays the page', () => {
          visitPage(overrides)
          verifyPageDisplayed()
        })
      }
    })
  })
}
