import Page from '../page'

export default class EditPhotoPage extends Page {
  constructor() {
    super('Add a new facial image')
  }

  uploadNew = () => cy.get('input[value="upload"]')

  uploadWebcam = () => cy.get('input[value="webcam"]')

  uploadWithheld = () => cy.get('input[value="withheld"]')

  fileUpload = () => cy.get('input[type="file"]')

  saveAndContinue = () => cy.get('button[type="submit"]')
}
