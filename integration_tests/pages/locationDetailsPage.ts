import Page, { PageElement } from './page'

export default class LocationDetailsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  moveToReceptionBtn = (): PageElement => cy.get('[data-qa="move-to-reception-action-button"]')
}
