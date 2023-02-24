import Page, { PageElement } from './page'

export default class PrisonerPhotoPage extends Page {
  constructor() {
    super('Photo page')
  }

  prisonerPhotoPartial = (): PageElement => cy.get('[prisoner-photo-page]')

  prisonerPhoto = (): PageElement => cy.get('[prisoner-photo]')

  prisonerPhotoPrintIcon = (): PageElement => cy.get('[prisoner-photo-print-icon]')

  breadcrumbToOverview = (): PageElement => cy.get('.govuk-breadcrumbs__link').last()
}
