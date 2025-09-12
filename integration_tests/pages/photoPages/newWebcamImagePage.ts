import Page from '../page'

export default class NewWebcamImagePage extends Page {
  constructor() {
    super('Take a photo with a webcam')
  }

  webcamFeed = () => cy.get('video')

  captureImage = () => cy.get('#captureImageButton')

  saveAndContinue = () => cy.get('button[type="submit"]')
}
