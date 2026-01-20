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

  imagePreview = (): PageElement => cy.get('.hmpps-file-upload-with-preview__photo')

  imageFilename = (): PageElement => cy.get('.govuk-file-upload-button__status')

  fileUploadButton = (): PageElement => cy.get('.govuk-file-upload-button')

  photoField = (): PageElement => cy.get('.govuk-file-upload')

  saveBtn = (): PageElement => cy.get('button[type=submit]')
}
