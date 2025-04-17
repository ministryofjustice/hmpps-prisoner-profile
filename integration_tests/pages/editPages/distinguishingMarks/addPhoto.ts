import Page, { PageElement } from '../../page'

export default class ChangePhoto extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  imagePreview = (): PageElement => cy.get('#mark-image-preview')

  imageFilename = (): PageElement => cy.get('#mark-image-filename')

  changeLink = (): PageElement => cy.get('[data-qa="change-photo-link"]')

  fileUploadButton = (): PageElement => cy.get('#mark-add-photo-upload-control input')

  photoField = (): PageElement => cy.get('input[type=file]')

  saveAndReturnBtn = (): PageElement => cy.get('button[type=submit][value=returnToMarkSummary][name=action]')

  saveAndAddAnotherBtn = (): PageElement => cy.get('button[type=submit][value=addAnotherPhoto][name=action]')
}
