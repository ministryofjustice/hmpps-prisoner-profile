import { Role } from '../../../../server/data/enums/role'
import EditPage from '../../../pages/editPages/editPage'
import { editPageTests } from './editPageTests'
import { inmateDetailMock } from '../../../../server/data/localMockData/inmateDetailMock'
import Page from '../../../pages/page'
import EditReligion from '../../../pages/editPages/religion'

context('Edit religion, faith or belief', () => {
  const prisonerNumber = 'G6123VU'
  const prisonerName = 'Saunders, John'
  const bookingId = 1102484

  context('Prisoner with existing religion, faith or belief', () => {
    editPageTests<EditPage>({
      prisonerNumber,
      prisonerName,
      bookingId,
      testSetup: () => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [Role.PrisonUser] })
        cy.setupComponentsData()
        cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
        cy.task('stubPersonalCareNeeds')
        cy.task('stubPersonIntegrationReligionUpdate', { prisonerNumber })
      },
      editUrl: `prisoner/${prisonerNumber}/personal/religion`,
      editPageWithTitle: EditPage,
      editPageTitle: 'Religion, faith or belief',
      successfulFlashMessage: 'Religion, faith or belief updated',
      isUnrestricted: true,
      validInputs: [
        { radioInputs: { religion: 'ZORO', reasonKnown: 'NO' } },
        {
          radioInputs: { religion: 'ZORO', reasonKnown: 'NO' },
          textAreaInputs: { reasonForChangeUnknown: 'Some text' },
        },
        { radioInputs: { religion: 'ZORO', reasonKnown: 'YES' }, textAreaInputs: { reasonForChange: 'Some text' } },
      ],
      invalidInputs: [
        {
          testDescription: 'Nothing selected',
          input: {},
          errorMessages: [
            `Select this person's religion, faith or belief`,
            `Select yes if you know why this person's religion, faith or belief has changed`,
          ],
        },
        {
          testDescription: 'No details provided when reason for change is known',
          input: {
            radioInputs: { religion: 'ZORO', reasonKnown: 'YES' },
          },
          errorMessages: [`Enter why this person's religion, faith or belief has changed`],
        },
        {
          testDescription: 'Text is too long when reason change is known',
          input: {
            radioInputs: { religion: 'ZORO', reasonKnown: 'YES' },
            textAreaInputs: { reasonForChange: 'a'.repeat(4001) },
          },
          errorMessages: [
            `The reason why this person's religion, faith or belief has changed must be 4,000 characters or less`,
          ],
        },
        {
          testDescription: 'Text is too long when reason change is not known',
          input: {
            radioInputs: { religion: 'ZORO', reasonKnown: 'NO' },
            textAreaInputs: { reasonForChangeUnknown: 'a'.repeat(4001) },
          },
          errorMessages: [`The details about this change must be 4,000 characters or less`],
        },
      ],
      redirectAnchor: 'religion-faith-or-belief',
    })

    it('Shows the current religion and change reason question', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')

      cy.signIn({ redirectPath: `/prisoner/${prisonerNumber}/personal/religion`, failOnStatusCode: false })
      const page = Page.verifyOnPageWithTitle(EditReligion, 'Religion, faith or belief')

      page.currentReligionDisplay().should('exist')
      page.religionValueInput().should('exist')
      page.changeReasonInput().should('exist')
      page.updateWarning().should('exist')
    })
  })

  context('Prisoner without existing religion, faith or belief', () => {
    editPageTests<EditPage>({
      prisonerNumber,
      prisonerName,
      bookingId,
      testSetup: () => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [Role.PrisonUser] })
        cy.setupComponentsData()
        cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
        cy.task('stubInmateDetail', {
          bookingId,
          inmateDetail: {
            ...inmateDetailMock,
            profileInformation: [],
          },
        })
        cy.task('stubPersonalCareNeeds')
        cy.task('stubPersonIntegrationReligionUpdate', { prisonerNumber })
      },
      editUrl: `prisoner/${prisonerNumber}/personal/religion`,
      editPageWithTitle: EditPage,
      editPageTitle: 'Religion, faith or belief',
      successfulFlashMessage: 'Religion, faith or belief updated',
      isUnrestricted: true,
      validInputs: [
        {
          radioInputs: { religion: 'ZORO' },
        },
      ],
      redirectAnchor: 'religion-faith-or-belief',
    })

    it('Does not show the current religion or ask why the value has changed', () => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser] })
      cy.setupComponentsData()
      cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
      cy.task('stubInmateDetail', {
        bookingId,
        inmateDetail: {
          ...inmateDetailMock,
          profileInformation: [],
        },
      })
      cy.task('stubPersonalCareNeeds')

      cy.signIn({ redirectPath: `/prisoner/${prisonerNumber}/personal/religion`, failOnStatusCode: false })
      const page = Page.verifyOnPageWithTitle(EditReligion, 'Religion, faith or belief')

      page.currentReligionDisplay().should('not.exist')
      page.religionValueInput().should('exist')
      page.changeReasonInput().should('not.exist')
      page.updateWarning().should('not.exist')
    })
  })
})
