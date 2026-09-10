import type { ErrorResponse } from '../../server/data/interfaces/xRayBodyScansApi'
import { pageResponse } from '../../server/data/localMockData/pageResponse'
import { mockLegacyScanResponse, mockScanResponse } from '../../server/data/localMockData/xRayBodyScansMock'
import { permissionsTests } from './permissionsTests'
import Page from '../pages/page'
import NotFoundPage from '../pages/notFoundPage'
import XrayBodyScans from '../pages/xrayBodyScans'

const prisonerNumber = 'G6123VU'
const possessivePrisonerName = 'John Saunders’'

context('X-ray body scans - Permissions', () => {
  const visitPage = prisonerDataOverrides => {
    cy.setupBannerStubs({ prisonerNumber, prisonerDataOverrides })
    cy.task('stubXRayBodyListScans', { prisonerNumber })
    cy.signIn({ failOnStatusCode: false, redirectPath: `prisoner/${prisonerNumber}/x-ray-body-scans` })
  }

  permissionsTests({
    prisonerNumber,
    visitPage,
    pageWithTitleToDisplay: { page: XrayBodyScans, title: possessivePrisonerName },
  })
})

context('X-ray body scans', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber })
    cy.task('stubGetAllPrisons')
  })

  it('Displays the page when there are no scans', () => {
    cy.task('stubXRayBodyListScans', { prisonerNumber })

    cy.signIn({ redirectPath: `prisoner/${prisonerNumber}/x-ray-body-scans` })
    const page = Page.verifyOnPageWithTitle(XrayBodyScans, possessivePrisonerName)
    page.mixedScansNote.should('not.exist')
    page.bodyScansTable.should('not.exist')
  })

  it('Displays the body scans history from DPS and NOMIS', () => {
    cy.task('stubXRayBodyListScans', {
      prisonerNumber,
      request: { size: 200 },
      response: pageResponse([
        mockScanResponse(prisonerNumber),
        {
          ...mockScanResponse(prisonerNumber),
          prisonId: 'ZZGHI',
          justification: 'INTELLIGENCE',
          justificationDescription: 'Intelligence-led',
          outcome: 'NEGATIVE',
          outcomeDescription: 'No item detected',
        },
        mockLegacyScanResponse(prisonerNumber),
      ]),
    })

    cy.signIn({ redirectPath: `prisoner/${prisonerNumber}/x-ray-body-scans` })
    const page = Page.verifyOnPageWithTitle(XrayBodyScans, possessivePrisonerName)
    page.mixedScansNote.should('contain.text', 'Scan information includes DPS and legacy records')
    page.alert.should('not.exist')
    page.bodyScansHistory.then(bodyScansHistory => {
      expect(bodyScansHistory).to.have.lengthOf(3)
      const year = `${new Date().getFullYear()}`
      expect(bodyScansHistory[0].date).to.contain(year)
      expect(bodyScansHistory[2].date).to.contain(year)
      expect(bodyScansHistory[0].comments).to.equal('Moorland (HMP & YOI) – Reasonable suspicion – Item detected')
      expect(bodyScansHistory[1].comments).to.equal('ZZGHI – Intelligence-led – No item detected')
      expect(bodyScansHistory[2].comments).to.equal('Intelligence - negative')
    })
  })

  it('Shows an error message if body scans history did not load', () => {
    const errorResponse: ErrorResponse = {
      status: 500,
      errorCode: null,
      userMessage: 'An unexpected error occurred',
      developerMessage: 'An unexpected error occurred',
      moreInfo: null,
    }
    cy.task('stubXRayBodyListScans', {
      prisonerNumber,
      request: { size: 200 },
      response: errorResponse,
    })

    cy.signIn({ redirectPath: `prisoner/${prisonerNumber}/x-ray-body-scans` })
    const page = Page.verifyOnPageWithTitle(XrayBodyScans, possessivePrisonerName)
    page.mixedScansNote.should('not.exist')
    page.alert.should('contain.text', 'The scan history could not be loaded')
    page.bodyScansTable.should('not.exist')
  })

  it('Shows 404 not found page when prisoner not found', () => {
    cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/asudhsdudhid/x-ray-body-scans' })
    Page.verifyOnPage(NotFoundPage)
  })
})
