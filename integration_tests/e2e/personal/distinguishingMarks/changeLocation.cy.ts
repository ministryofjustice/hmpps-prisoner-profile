import { Role } from '../../../../server/data/enums/role'
import Page from '../../../pages/page'
import NotFoundPage from '../../../pages/notFoundPage'
import { scarMock } from '../../../../server/data/localMockData/distinguishingMarksMock'
import ChangeLocation from '../../../pages/editPages/distinguishingMarks/changeLocation'
import ChangeBodyPart from '../../../pages/editPages/distinguishingMarks/changeBodyPart'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const markId = '100'

const visitChangeLocationTattooPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/tattoo/${markId}/body-part` })
}

const visitChangeLocationScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/scar/${markId}/body-part` })
}

context('Change location of distinguishing mark on face', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })

      visitChangeLocationTattooPage({ failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('Page contents', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
      cy.task('stubPutDistinguishingMark', { prisonerNumber })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    })

    function testChangeDistinguishingMarkDetailWithRadios(bodyPartSelectorAlt) {
      return (bodyPart: string) => {
        it(`User can add distinguishing mark detail for body part: ${bodyPart}`, () => {
          cy.task('stubGetDistinguishingMark', { prisonerNumber, response: scarMock })
          visitChangeLocationScarPage()
          const bodyPage = Page.verifyOnPageWithTitle(ChangeBodyPart, 'Change where the scar is')

          const selection = bodyPage.bodyParts().filter(`[alt="${bodyPartSelectorAlt}"]`)
          selection.click({ force: true })

          // Click on the left arm twice as it is initially selected so the first click unselects it
          if (bodyPartSelectorAlt === 'Left arm') {
            selection.click({ force: true })
          }

          bodyPage.continueBtn().click()

          const page = Page.verifyOnPageWithTitle(ChangeLocation, 'Change the location of the scar')

          page.bodyPartRadios().filter(`[value="${bodyPart}"]`).check()

          page.saveBtn().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/scar/100')
        })
      }
    }

    context('Change distinguishing mark detail for face and head', () => {
      const specificBodyParts = ['face', 'ear', 'nose', 'lip', 'head']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Face and head')
      specificBodyParts.forEach(testMethod)
    })

    context('Change distinguishing mark detail for right arm', () => {
      const specificBodyParts = ['rightArm', 'rightShoulder', 'upperRightArm', 'rightElbow', 'lowerRightArm']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Right arm')
      specificBodyParts.forEach(testMethod)
    })

    context('Change distinguishing mark detail for left arm', () => {
      const specificBodyParts = ['leftArm', 'leftShoulder', 'upperLeftArm', 'leftElbow', 'lowerLeftArm']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Left arm')
      specificBodyParts.forEach(testMethod)
    })

    context('Change distinguishing mark detail for right foot', () => {
      const specificBodyParts = ['rightFoot', 'rightAnkle', 'rightToe']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Right foot')
      specificBodyParts.forEach(testMethod)
    })

    context('Change distinguishing mark detail for left foot', () => {
      const specificBodyParts = ['leftFoot', 'leftAnkle', 'leftToe']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Left foot')
      specificBodyParts.forEach(testMethod)
    })

    context('Change distinguishing mark detail for right hand', () => {
      const specificBodyParts = ['rightHand', 'rightFinger']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Right hand')
      specificBodyParts.forEach(testMethod)
    })

    context('Change distinguishing mark detail for left hand', () => {
      const specificBodyParts = ['leftHand', 'leftFinger']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Left hand')
      specificBodyParts.forEach(testMethod)
    })

    context('Change distinguishing mark detail for right leg', () => {
      const specificBodyParts = ['rightLeg', 'rightThigh', 'rightKnee', 'lowerRightLeg']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Right leg')
      specificBodyParts.forEach(testMethod)
    })

    context('Change distinguishing mark detail for left leg', () => {
      const specificBodyParts = ['leftLeg', 'leftThigh', 'leftKnee', 'lowerLeftLeg']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Left leg')
      specificBodyParts.forEach(testMethod)
    })

    context('Change distinguishing mark detail for torso', () => {
      const specificBodyParts = ['frontTorso', 'rightTorso', 'leftTorso']

      const testMethod = testChangeDistinguishingMarkDetailWithRadios('Front and sides')
      specificBodyParts.forEach(testMethod)
    })
  })
})
