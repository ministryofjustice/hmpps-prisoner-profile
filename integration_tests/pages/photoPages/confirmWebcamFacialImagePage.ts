import Page from '../page'

export default class ConfirmWebcamFacialImagePage extends Page {
  constructor() {
    super('Confirm facial image captured by webcam')
  }

  saveAndContinue = () => cy.get('button[type="submit"]')
}
