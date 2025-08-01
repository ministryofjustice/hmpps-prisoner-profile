import { Role } from '../../../../server/data/enums/role'
import { hasLength } from '../../../../server/utils/utils'
import EditPage, { CheckboxValue, RadioValue } from '../../../pages/editPages/editPage'
import NotFoundPage from '../../../pages/notFoundPage'
import Page from '../../../pages/page'

export interface EditPageInput {
  textInputs?: { [key: string]: string }
  textAreaInputs?: { [key: string]: string }
  radioInputs?: { [key: string]: RadioValue }
  checkboxInputs?: { [key: string]: CheckboxValue[] }
  autocompleteInputs?: { [key: string]: string }
  addressAutoSuggestInputs?: { [key: string]: string }
}

export function editPageTests<TPage extends EditPage>(options: {
  editUrl: string
  prisonerNumber: string
  prisonerName: string
  bookingId: number
  testSetup: () => void
  editPage?: new () => TPage
  editPageWithTitle?: new (title: string) => TPage
  editPageTitle?: string
  successfulFlashMessage?: string
  validInputs: EditPageInput[]
  invalidInputs?: {
    testDescription: string
    input: EditPageInput
    errorMessages: string[]
  }[]
  redirectUrl?: string
  redirectAnchor?: string
  personalPageHref?: string
  submitButtonId?: string
  isUnrestricted?: boolean
}) {
  const {
    editUrl,
    prisonerNumber,
    prisonerName,
    testSetup,
    validInputs,
    editPage,
    editPageWithTitle,
    editPageTitle,
    successfulFlashMessage,
    invalidInputs,
    redirectUrl = '/prisoner/G6123VU/personal',
    redirectAnchor,
    submitButtonId,
    isUnrestricted,
  } = options

  let page: TPage

  const fillWithInputs = (input: EditPageInput) => {
    if (input.textInputs) page.fillInTextFields(input.textInputs)
    if (input.radioInputs) page.selectRadios(input.radioInputs)
    if (input.checkboxInputs) page.selectCheckboxes(input.checkboxInputs)
    if (input.autocompleteInputs) page.fillInAutocompleteFields(input.autocompleteInputs)
    if (input.addressAutoSuggestInputs) page.fillInAddressAutoSuggestFields(input.addressAutoSuggestInputs)
    if (input.textAreaInputs) page.fillInTextAreaFields(input.textAreaInputs)
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
    if (!isUnrestricted) {
      context('Permissions', () => {
        if (options.personalPageHref) {
          it('Doesnt show an edit link on the personal page if they dont have the permissions', () => {
            cy.setupUserAuth({ roles: [Role.PrisonUser] })

            cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/personal' })
            cy.get(`a[href="${options.personalPageHref}"]`).should('not.exist')
          })
        }

        it('Doesnt let the user access if they dont have the permissions', () => {
          cy.setupUserAuth({ roles: [Role.PrisonUser] })

          cy.signIn({ failOnStatusCode: false, redirectPath: editUrl })
          Page.verifyOnPage(NotFoundPage)
        })
      })
    }

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

      if (options.personalPageHref) {
        it('Shows an edit link on the personal page', () => {
          cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/personal' })
          cy.get(`a[href="${options.personalPageHref}"]`).should('exist')
        })
      }

      context('Submitting valid responses', () => {
        beforeEach(() => {
          cy.signIn({ redirectPath: editUrl })
        })

        it('Can load the edit page', () => {
          page = getPage()
          page.miniBanner().card().should('be.visible')
          page.miniBanner().name().should('contain.text', prisonerName)
          page.miniBanner().name().should('contain.text', prisonerNumber)
        })

        validInputs.forEach((validInput, index) => {
          it(`Can submit a valid input (${index + 1} of ${validInputs.length})`, () => {
            page = getPage()
            fillWithInputs(validInput)
            page.submit(submitButtonId)

            cy.location('pathname').should('eq', redirectUrl)

            if (redirectAnchor) cy.location('hash').should('eq', `#${redirectAnchor}`)
            if (successfulFlashMessage) page.flashMessage().should('include.text', successfulFlashMessage)
          })
        })
      })

      if (hasLength(invalidInputs)) {
        context('It handles invalid responses', () => {
          invalidInputs.forEach(({ testDescription, input, errorMessages }) => {
            it(`Handles invalid input: ${testDescription}`, () => {
              cy.signIn({ redirectPath: editUrl })
              page = getPage()
              fillWithInputs(input)
              cy.url().then(url => {
                cy.intercept('POST', url, req => {
                  req.headers.Referrer = url
                })
                page.submit(submitButtonId)
                errorMessages.forEach(message => {
                  page.errorMessage().should('include.text', message)
                })

                // Ensure inputted values are persisted across errors
                if (input.textInputs) {
                  Object.entries(input.textInputs).forEach(([key, value]) => {
                    cy.get(`input[name='${key}']`).should('have.value', value)
                  })
                }
              })
            })
          })
        })
      }
    })
  })
}
