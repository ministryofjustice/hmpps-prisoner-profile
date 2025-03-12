import Page from '../page'

export default class ConfirmFacialImagePage extends Page {
  constructor() {
    super('Confirm facial image')
  }

  saveAndContinue = () => cy.get('button[type="submit"]')
}
