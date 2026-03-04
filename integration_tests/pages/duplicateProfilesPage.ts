import Page, { PageElement } from './page'

export default class DuplicateProfilesPage extends Page {
  constructor(fullName: string) {
    super(`Possible duplicate profiles for ${fullName}`)
  }

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  h1 = (): PageElement => cy.get('h1')

  duplicates = () => cy.get('table tbody tr')

  duplicate = (i: number) => ({
    photo: () => cy.get('table tbody tr').eq(i).find('td').eq(0),
    name: () => cy.get('table tbody tr').eq(i).find('td').eq(1),
    prisonNumber: () => cy.get('table tbody tr').eq(i).find('td').eq(2),
    location: () => cy.get('table tbody tr').eq(i).find('td').eq(3),
    incentiveLevel: () => cy.get('table tbody tr').eq(i).find('td').eq(4),
    age: () => cy.get('table tbody tr').eq(i).find('td').eq(5),
    alerts: () => cy.get('table tbody tr').eq(i).find('td').eq(6),
  })
}
