import Page, { PageElement } from '../page'

export default class PrisonerPhotoListPage extends Page {
  constructor() {
    super('All facial images')
  }

  prisonerPhotoPartial = (): PageElement => cy.get('[prisoner-photo-page]')

  prisonerPhoto = (): PageElement => cy.get('[prisoner-photo]')

  prisonerPhotoPrintIcon = (): PageElement => cy.get('[prisoner-photo-print-icon]')

  breadcrumbToOverview = (): PageElement => cy.get('.govuk-breadcrumbs__link').last()

  printLink = (): PageElement => cy.get('#profile-photo-print-link')

  photoList = () => ({
    row: (row: number) => {
      const rowItem = () => cy.getDataQa('image-list').findDataQa('image-list-item').eq(row)
      return {
        photo: () => rowItem().findDataQa('prisoner-photo'),
        details: () => rowItem().findDataQa('image-item-details'),
      }
    },
  })
}
