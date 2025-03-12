import { Role } from '../../../../server/data/enums/role'
import Page from '../../../pages/page'
import NotFoundPage from '../../../pages/notFoundPage'
import NewDistinguishingMark from '../../../pages/editPages/distinguishingMarks/newDistinguishingMark'
import PersonalPage from '../../../pages/personalPage'
import DistinguishingMarkDetail from '../../../pages/editPages/distinguishingMarks/distinguishingMarkDetail'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484

const visitNewTattooPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/tattoo` })
}

const visitNewScarPage = ({ failOnStatusCode = true, prisonerNo = prisonerNumber } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: `/prisoner/${prisonerNo}/personal/scar` })
}

context('New distinguishing mark on face', () => {
  context('Permissions', () => {
    it('Displays not found page if the user does not have permissions', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonerData', { prisonerNumber })
      cy.task('stubPostNewDistinguishingMark', { prisonerNumber })

      visitNewTattooPage({ failOnStatusCode: false })
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
      cy.task('stubPostNewDistinguishingMark', { prisonerNumber })
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    })

    function testAddDistinguishingMarkDetailWithRadios(title, bodyPartSelectorAlt) {
      return (bodyPart: string) => {
        it(`User can add distinguishing mark detail for body part: ${bodyPart}`, () => {
          visitNewScarPage()
          const bodyPage = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the scar is')

          const selection = bodyPage.bodyParts().filter(`[alt="${bodyPartSelectorAlt}"]`)
          selection.click({ force: true })
          bodyPage.continueBtn().click()

          const page = Page.verifyOnPageWithTitle(DistinguishingMarkDetail, title)

          page.bodyPartRadios().filter(`[value="${bodyPart}"]`).check()
          page.descriptionFields().filter(`[name="description-${bodyPart}"]`).type('Description')
          page.imageFields().filter(`[name="file"]`).attachFile('tat.jpeg')

          page.saveAndExitBtn().click()
          Page.verifyOnPage(PersonalPage)
        })
      }
    }

    function testAddDistinguishingMarkDetailSingleField(title: string, bodyPartSelectorAlt: string, bodyPart: string) {
      it(`User can add distinguishing mark detail for body part: ${bodyPart}`, () => {
        visitNewScarPage()
        const bodyPage = Page.verifyOnPageWithTitle(NewDistinguishingMark, 'Select where the scar is')

        const selection = bodyPage.bodyParts().filter(`[alt="${bodyPartSelectorAlt}"]`)
        selection.click({ force: true })
        bodyPage.continueBtn().click()

        const page = Page.verifyOnPageWithTitle(DistinguishingMarkDetail, title)

        page.descriptionFields().filter(`[name="description-${bodyPart}"]`).type('Description')
        page.imageFields().filter(`[name="file"]`).attachFile('tat.jpeg')

        page.saveAndExitBtn().click()
        Page.verifyOnPage(PersonalPage)
      })
    }

    context('Adding distinguishing mark detail for face and head', () => {
      const specificBodyParts = ['face', 'ear', 'nose', 'lip', 'head']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add face and head scar details', 'Face and head')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for right arm', () => {
      const specificBodyParts = ['rightArm', 'rightShoulder', 'upperRightArm', 'rightElbow', 'lowerRightArm']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add right arm scar details', 'Right arm')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for left arm', () => {
      const specificBodyParts = ['leftArm', 'leftShoulder', 'upperLeftArm', 'leftElbow', 'lowerLeftArm']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add left arm scar details', 'Left arm')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for right foot', () => {
      const specificBodyParts = ['rightFoot', 'rightAnkle', 'rightToe']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add right foot scar details', 'Right foot')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for left foot', () => {
      const specificBodyParts = ['leftFoot', 'leftAnkle', 'leftToe']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add left foot scar details', 'Left foot')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for right hand', () => {
      const specificBodyParts = ['rightHand', 'rightFinger']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add right hand scar details', 'Right hand')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for left hand', () => {
      const specificBodyParts = ['leftHand', 'leftFinger']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add left hand scar details', 'Left hand')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for right leg', () => {
      const specificBodyParts = ['rightLeg', 'rightThigh', 'rightKnee', 'lowerRightLeg']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add right leg scar details', 'Right leg')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for left leg', () => {
      const specificBodyParts = ['leftLeg', 'leftThigh', 'leftKnee', 'lowerLeftLeg']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add left leg scar details', 'Left leg')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for torso', () => {
      const specificBodyParts = ['frontTorso', 'rightTorso', 'leftTorso']

      const testMethod = testAddDistinguishingMarkDetailWithRadios('Add front and side scar details', 'Front and sides')
      specificBodyParts.forEach(testMethod)
    })

    context('Adding distinguishing mark detail for neck', () => {
      testAddDistinguishingMarkDetailSingleField('Add neck scar details', 'Neck', 'neck')
    })

    context('Adding distinguishing mark detail for back', () => {
      testAddDistinguishingMarkDetailSingleField('Add back scar details', 'Back', 'back')
    })
  })
})
