import type { PageElement } from '../page'

export default class PagedList {
  get header(): PageElement<HTMLDivElement> {
    return cy.get('div.hmpps-paged-list__header')
  }

  get headerResults(): PageElement<HTMLParagraphElement> {
    return this.header.find('.hmpps-paged-list__results')
  }

  get headerPreviousLink(): PageElement<HTMLAnchorElement> {
    return this.header.find('.govuk-pagination__prev a')
  }

  get headerNextLink(): PageElement<HTMLAnchorElement> {
    return this.header.find('.govuk-pagination__next a')
  }

  get headerCurrentPage(): PageElement<HTMLAnchorElement> {
    return this.header.find('.govuk-pagination__item--current a')
  }

  get headerPageLinks(): PageElement<HTMLAnchorElement> {
    return this.header.find('.govuk-pagination__list a')
  }

  get headerViewAllLink(): PageElement<HTMLAnchorElement> {
    return this.header.find('.hmpps-paged-list__view-all a')
  }

  get footer(): PageElement<HTMLDivElement> {
    return cy.get('div.hmpps-paged-list__footer')
  }

  get footerResults(): PageElement<HTMLParagraphElement> {
    return this.footer.find('.hmpps-paged-list__results')
  }

  get footerPageLinks(): PageElement<HTMLAnchorElement> {
    return this.footer.find('.govuk-pagination__list a')
  }
}
