import { Role } from '../../../../server/data/enums/role'
import { hasLength } from '../../../../server/utils/utils'
import EditPage from '../../../pages/editPages/editPage'
import EditHeight from '../../../pages/editPages/heightImperial'
import NotFoundPage from '../../../pages/notFoundPage'
import Page from '../../../pages/page'

interface EditPageInputs {
  textInputs?: { [key: string]: string }
}

function editPageTests<TPage extends EditPage>(options: {
  editUrl: string
  prisonerNumber: string
  bookingId: number
  testSetup: () => void
  editPage?: new () => TPage
  editPageWithTitle?: new (title: string) => TPage
  editPageTitle?: string
  successfulFlashMessage: string
  validInputs: EditPageInputs
  invalidResponses: {
    testDescription: string
    inputs: EditPageInputs
    errorMessages: string[]
  }[]
}) {
  const {
    editUrl,
    testSetup,
    validInputs,
    editPage,
    editPageWithTitle,
    editPageTitle,
    successfulFlashMessage,
    invalidResponses,
  } = options

  let page: TPage

  const fillWithInputs = (inputs: EditPageInputs) => {
    if (inputs.textInputs) page.fillInTextFields(inputs.textInputs)
  }

  context('Edit page tests', () => {
    beforeEach(() => {
      testSetup()
    })

    /* 
    Permissions tests
    For now we just do permissions based on the role so this can be shared
    across multiple tests easily, it might need its own option in the future
  */

    context('Permissions', () => {
      it('Doesnt let the user access if they dont have the permissions', () => {
        cy.setupUserAuth({
          caseLoads: [
            {
              caseLoadId: 'MDI',
              currentlyActive: true,
              description: '',
              type: '',
              caseloadFunction: '',
            },
          ],
          roles: [Role.PrisonUser],
        })

        cy.signIn({ failOnStatusCode: false, redirectPath: editUrl })
        Page.verifyOnPage(NotFoundPage)
      })
    })

    context('User with permissions', () => {
      const getPage = (): TPage => {
        if (editPage) {
          return Page.verifyOnPage(editPage)
        }

        if (editPageWithTitle) {
          return Page.verifyOnPageWithTitle(editPageWithTitle, editPageTitle)
        }

        return null
      }

      context('Submitting valid responses', () => {
        beforeEach(() => {
          cy.signIn({ redirectPath: editUrl })
        })

        it('Can load the edit page', () => {
          getPage()
        })

        it('Can submit a valid response', () => {
          page = getPage()
          fillWithInputs(validInputs)
          page.submit()
          page.flashMessage().should('include.text', successfulFlashMessage)
        })
      })

      if (hasLength(invalidResponses)) {
        context('It handles invalid responses', () => {
          invalidResponses.forEach(({ testDescription, inputs, errorMessages }) => {
            it(`Handles invalid input: ${testDescription}`, () => {
              cy.signIn({ redirectPath: editUrl })
              page = getPage()
              fillWithInputs(inputs)
              page.submit()
              errorMessages.forEach(message => {
                page.errorMessage().should('include.text', message)
              })
            })
          })
        })
      }
    })
  })
}

context('Edit height (metric)', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  editPageTests<EditHeight>({
    prisonerNumber,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [
          {
            caseLoadId: 'MDI',
            currentlyActive: true,
            description: '',
            type: '',
            caseloadFunction: '',
          },
        ],
        roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'],
      })
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/height`,
    validInputs: { textInputs: { editField: '125' } },
    invalidResponses: [
      {
        testDescription: 'Empty',
        inputs: { textInputs: { editField: '' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'Negative number',
        inputs: { textInputs: { editField: '-10' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'Zero',
        inputs: { textInputs: { editField: '0' } },
        errorMessages: ['Enter a number greater than 0'],
      },
    ],
    editPageWithTitle: EditHeight,
    editPageTitle: 'Edit Height',
    successfulFlashMessage: 'Height edited',
  })
})

context('Edit height (Imperial)', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  editPageTests<EditHeight>({
    prisonerNumber,
    bookingId,
    testSetup: () => {
      cy.task('reset')
      cy.setupUserAuth({
        caseLoads: [
          {
            caseLoadId: 'MDI',
            currentlyActive: true,
            description: '',
            type: '',
            caseloadFunction: '',
          },
        ],
        roles: [Role.PrisonUser, 'DPS_APPLICATION_DEVELOPER'],
      })
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.task('stubPrisonPerson', { prisonerNumber })
      cy.task('stubPrisonPersonUpdatePhysicalAttributes', { prisonerNumber })
      cy.setupPersonalPageSubs({ prisonerNumber, bookingId })
      cy.task('stubPersonalCareNeeds')
    },
    editUrl: `prisoner/${prisonerNumber}/personal/edit/height/imperial`,
    validInputs: { textInputs: { feet: '5', inches: '3' } },
    invalidResponses: [
      {
        testDescription: 'Feet: Empty',
        inputs: { textInputs: { feet: '', inches: '5' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'Feet: Negative number',
        inputs: { textInputs: { feet: '-1', inches: '5' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'Feet: Zero',
        inputs: { textInputs: { feet: '0', inches: '5' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'Inches: Empty',
        inputs: { textInputs: { feet: '5', inches: '' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'Inches: Negative number',
        inputs: { textInputs: { feet: '5', inches: '-1' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'Inches: Zero',
        inputs: { textInputs: { feet: '5', inches: '0' } },
        errorMessages: ['Enter a number greater than 0'],
      },
      {
        testDescription: 'No input',
        inputs: { textInputs: { feet: '', inches: '' } },
        errorMessages: ['Enter a number greater than 0'],
      },
    ],
    editPageWithTitle: EditHeight,
    editPageTitle: 'Edit height',
    successfulFlashMessage: 'Height edited',
  })
})
