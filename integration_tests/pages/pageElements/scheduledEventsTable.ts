import type { PageElement } from '../page'

export interface Event {
  time: string
  description: string
}

export class ScheduledEventsTable {
  constructor(private readonly selector: string) {}

  get container(): PageElement<HTMLDivElement> {
    return cy.get(this.selector)
  }

  get title(): Cypress.Chainable<string> {
    return this.container.find<HTMLHeadingElement>('h2').invoke('text')
  }

  get eventsDivs(): PageElement<HTMLDivElement> {
    return this.container.find('div.scheduled-event')
  }

  get eventsList(): Cypress.Chainable<Event[]> {
    return this.eventsDivs.then($divs =>
      $divs
        .map<Event>((_index, div) => ({
          time: (div.getElementsByClassName('scheduled-event__time')[0] as HTMLDivElement)?.innerText?.trim(),
          description: (div.getElementsByTagName('PRE')[0] as HTMLPreElement)?.innerText?.trim(),
        }))
        .toArray(),
    )
  }

  get noEventsComment(): PageElement<HTMLParagraphElement> {
    return this.container.find('[data-qa=no-scheduled-events')
  }
}
