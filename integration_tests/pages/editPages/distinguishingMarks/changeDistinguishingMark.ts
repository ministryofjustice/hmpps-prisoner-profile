import Page, { PageElement } from '../../page'

export default class ChangeDistinguishingMark extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  h1 = (): PageElement => cy.get('h1')

  miniBanner = () => ({
    card: (): PageElement => cy.get('.hmpps-mini-banner'),
    name: (): PageElement => this.miniBanner().card().find('.hmpps-mini-banner__name'),
  })

  markDetails = () => {
    const summaryListValues = () => cy.get('.govuk-summary-list__value')
    return {
      bodyPart: () => summaryListValues().eq(0),
      location: () => summaryListValues().eq(1),
      description: () => summaryListValues().eq(2),
      photo: () => summaryListValues().eq(3),
    }
  }

  changeableImage = () => {
    const imageContainer = () => cy.get('.mark-changeable-image')
    return {
      image: () => imageContainer().children('img'),
      link: () => imageContainer().get('.mark-changeable-image__overlay').children('a'),
    }
  }
}
