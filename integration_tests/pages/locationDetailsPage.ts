import Page, { PageElement } from './page'

interface PreviousLocationDetails {
  location: HTMLElement
  movedIn: HTMLElement
  movedInBy: HTMLElement
  movedOut: HTMLElement
  linkVisible: boolean
  link: string
}

export default class LocationDetailsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  changeCellBtn = (): PageElement => cy.getDataQa('change-cell-action-button')

  moveToReceptionBtn = (): PageElement => cy.getDataQa('move-to-reception-action-button')

  currentInmate = (inmateOrder: number): PageElement =>
    cy.get(`[data-qa="currently-sharing-with"] > p:nth-child(${inmateOrder})`)

  currentLocationHistoryLink = (): PageElement => cy.getDataQa('current-location-history-link')

  previousLocationAgency = (agencyOrder: number): PageElement =>
    cy.get(`[data-qa="previous-locations"] > div:nth-child(${agencyOrder}) > h3`)

  previousLocation = (
    agencyOrder: number,
    locationInAgencyOrder: number,
    callback: (previousLocationDetails: PreviousLocationDetails) => void,
  ): PageElement =>
    cy
      .get(
        `[data-qa="previous-locations"] > div:nth-child(${agencyOrder}) > table > tbody > tr:nth-child(${locationInAgencyOrder}) > td`,
      )
      .then(row => {
        callback({
          location: row[0],
          movedIn: row[1],
          movedInBy: row[2],
          movedOut: row[3],
          linkVisible: row[4].hasChildNodes(),
          link: row[4].firstElementChild?.getAttribute('href'),
        })
      })
}
