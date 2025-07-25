import { Role } from '../../../../../server/data/enums/role'
import Page from '../../../../pages/page'
import NotFoundPage from '../../../../pages/notFoundPage'
import ChangeDistinguishingMark from '../../../../pages/editPages/distinguishingMarks/changeDistinguishingMark'
import { markMock, scarMock, tattooMock } from '../../../../../server/data/localMockData/distinguishingMarksMock'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'Saunders, John'
const markId = '100'

const visitChangeTattooPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/tattoo/${markId}` })
}

const visitChangeScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/scar/${markId}` })
}

const visitChangeMarkPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/mark/${markId}` })
}

context('Change distinguishing mark', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: tattooMock })

      visitChangeTattooPage({ failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('Page contents', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
    })

    it('User can access the change tattoo page', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: tattooMock })
      visitChangeTattooPage()
      const page = Page.verifyOnPageWithTitle(ChangeDistinguishingMark, 'Change tattoo details')
      page.miniBanner().card().should('be.visible')
      page.miniBanner().name().should('contain.text', prisonerName)
      page.miniBanner().name().should('contain.text', prisonerNumber)

      page.h1().should('contain.text', 'Change tattoo details')
      page.markDetails().bodyPart().should('contain.text', 'Front and sides')
      page.markDetails().location().should('contain.text', 'Not entered')
      page.markDetails().description().should('contain.text', 'Hand sewn mickey mouse stormtrooper')
      page.markDetails().photo().should('be.visible')
      verifyImageLinks(page)
    })

    it('User can access the change scar page', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: scarMock })
      visitChangeScarPage()
      const page = Page.verifyOnPageWithTitle(ChangeDistinguishingMark, 'Change scar details')

      page.h1().should('contain.text', 'Change scar details')
      page.markDetails().bodyPart().should('contain.text', 'Left arm')
      page.markDetails().location().should('contain.text', 'Arm (general)')
      page.markDetails().description().should('contain.text', 'Horrible arm scar')
      page.markDetails().photo().should('be.visible')
      verifyImageLinks(page)
    })

    it('User can access the change mark page', () => {
      cy.task('stubGetDistinguishingMark', { prisonerNumber, response: markMock })
      visitChangeMarkPage()
      const page = Page.verifyOnPageWithTitle(ChangeDistinguishingMark, 'Change mark details')

      page.h1().should('contain.text', 'Change mark details')
      page.markDetails().bodyPart().should('contain.text', 'Left leg')
      page.markDetails().location().should('contain.text', 'Leg (general)')
      page.markDetails().description().should('contain.text', 'Bump')
      page.markDetails().photo().should('be.visible')
      verifyImageLinks(page)
    })

    function verifyImageLinks(page: ChangeDistinguishingMark) {
      page.changeableImage().image().should('have.length', 1)
      page.changeableImage().image().should('be.visible')
      page.changeableImage().link().should('contain.text', 'Change').and('not.be.visible')

      page.newImagePlaceholder().link().should('be.visible')
      page.newImagePlaceholder().link().should('contain.text', 'Add photo')
    }
  })
})
