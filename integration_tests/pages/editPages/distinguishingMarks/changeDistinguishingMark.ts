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
    const infoTable = () => cy.get('.mark-edit-details-table')
    return {
      bodyPart: () => infoTable().find('[data-qa=body-part]').find('td').eq(0),
      location: () => infoTable().find('[data-qa=location]').find('td').eq(0),
      description: () => infoTable().find('[data-qa=description]').find('td').eq(0),
      photo: () => infoTable().find('[data-qa=photos]').find('td').eq(0),
    }
  }

  changeableImage = () => {
    const imageContainer = () => cy.get('.mark-changeable-image')
    return {
      image: () => imageContainer().children('img'),
      link: () => imageContainer().get('.mark-changeable-image__overlay').children('a'),
    }
  }

  newImagePlaceholder = () => {
    const imageContainer = () => cy.get('.mark-new-image-placeholder')
    return {
      link: () => imageContainer().find('a'),
    }
  }
}
