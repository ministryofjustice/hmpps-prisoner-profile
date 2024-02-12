import Page, { PageElement } from './page'

export default class LocationDetailsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  changeCellBtn = (): PageElement => cy.getDataQa('change-cell-action-button')

  moveToReceptionBtn = (): PageElement => cy.getDataQa('move-to-reception-action-button')

  currentInmate = (inmateOrder): PageElement =>
    cy.get(`[data-qa="currently-sharing-with"] > p:nth-child(${inmateOrder})`)

  locationHistoryLink = (): PageElement => cy.getDataQa('location-history-link')
}
