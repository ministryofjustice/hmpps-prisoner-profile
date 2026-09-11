import Page from '../../pages/page'
import PersonalPage from '../../pages/personalPage'
import {
  propertySummaryDueOutMock,
  propertySummaryEmptyMock,
  propertySummaryMock,
} from '../../../server/data/localMockData/prisonerPropertySummaryMock'

/**
 * The property summary card replaces the NOMIS-backed property card only for prisons the property
 * service has been switched on for. `personalPage.cy.ts` covers the card as it is today and must
 * keep passing unchanged — that is the regression guard for prisons still on NOMIS.
 *
 * The profile caches the active-agency list in process for a few minutes, so this spec keeps one
 * stable active list (IWI) throughout and uses a prisoner at MDI for the "not switched on" case,
 * rather than flipping the same prison's state between tests.
 */
context('Property summary card', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  const activePrisonCaseLoads = [
    {
      caseLoadId: 'IWI',
      description: 'Isle of Wight (HMP)',
      type: 'INST',
      caseloadFunction: 'GENERAL',
      currentlyActive: true,
    },
    {
      caseLoadId: 'MDI',
      description: 'Moorland Closed (HMP & YOI)',
      type: 'INST',
      caseloadFunction: 'GENERAL',
      currentlyActive: false,
    },
  ]

  const visitPersonalPage = ({ prisonId, summary }) => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData({ caseLoads: activePrisonCaseLoads })
    cy.setupPersonalPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { prisonId } })
    cy.task('stubPersonalCareNeeds')
    cy.task('stubPropertyActiveAgencies', ['IWI'])
    if (summary) {
      cy.task('stubPrisonerPropertySummary', { prisonerNumber, response: summary })
    }

    cy.signIn({ redirectPath: `prisoner/${prisonerNumber}/personal` })
    return Page.verifyOnPage(PersonalPage)
  }

  it('shows containers held here, more due in, and one overdue for disposal', () => {
    const page = visitPersonalPage({ prisonId: 'IWI', summary: propertySummaryMock })

    page.propertySummary().containerCount().should('contain.text', '2 property containers in Isle of Wight (HMP)')
    page.propertySummary().dueForTransferIn().should('contain.text', 'Due for transfer in: 3')
    page.propertySummary().dueForTransferOut().should('contain.text', 'Due for transfer out: 0')
    page.propertySummary().overdueForDisposal().should('contain.text', '1 overdue for disposal')
    page.propertySummary().overdueForReturn().should('not.exist')
    page
      .propertySummary()
      .containersLink()
      .should('have.attr', 'href')
      .and('match', new RegExp(`/prisoner/${prisonerNumber}$`))
  })

  it('shows containers due out and overdue for both disposal and return', () => {
    const page = visitPersonalPage({ prisonId: 'IWI', summary: propertySummaryDueOutMock })

    page.propertySummary().containerCount().should('contain.text', '3 property containers in Isle of Wight (HMP)')
    page.propertySummary().dueForTransferOut().should('contain.text', 'Due for transfer out: 5')
    page.propertySummary().overdueForDisposal().should('contain.text', '1 overdue for disposal')
    page.propertySummary().overdueForReturn().should('contain.text', '1 overdue for return')
  })

  it('links to the property history when the person has no containers', () => {
    const page = visitPersonalPage({ prisonId: 'IWI', summary: propertySummaryEmptyMock })

    page.propertySummary().containerCount().should('contain.text', '0 property containers in Isle of Wight (HMP)')
    page.propertySummary().overdueForDisposal().should('not.exist')
    page.propertySummary().containersLink().should('not.exist')
    page
      .propertySummary()
      .historyLink()
      .should('have.attr', 'href')
      .and('match', new RegExp(`/prisoner/${prisonerNumber}/history$`))
  })

  it('shows the existing property card for a prison the property service is not switched on for', () => {
    const page = visitPersonalPage({ prisonId: 'MDI', summary: propertySummaryMock })

    cy.get('[data-qa=property-summary]').should('not.exist')
    page.property().item(0).containerType().should('exist')
  })

  it('falls back to the existing property card when the summary cannot be retrieved', () => {
    const page = visitPersonalPage({ prisonId: 'IWI', summary: null })

    cy.get('[data-qa=property-summary]').should('not.exist')
    page.property().item(0).containerType().should('exist')
  })
})
