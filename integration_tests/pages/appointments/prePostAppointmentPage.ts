import Page, { type PageElement } from '../page'
import { RadioButtons } from '../pageElements/radioButtons'
import { SelectElement } from '../pageElements/selectElement'
import { ScheduledEventsTable } from '../pageElements/scheduledEventsTable'
import { SummaryList } from '../pageElements/summaryList'

export class PrePostAppointmentPage extends Page {
  constructor() {
    super('Video link booking details')
  }

  summaryList = new SummaryList('.appointment-details-list')

  addPreAppointmentRadio = new RadioButtons('preAppointment')

  preLocationSelect = new SelectElement('#preAppointmentLocation')

  preScheduledEventsTable = new ScheduledEventsTable('#preAppointmentEventsContainer')

  addPostAppointmentRadio = new RadioButtons('postAppointment')

  postLocationSelect = new SelectElement('#postAppointmentLocation')

  postScheduledEventsTable = new ScheduledEventsTable('#postAppointmentEventsContainer')

  courtSelect = new SelectElement('#court')

  hearingTypeSelect = new SelectElement('#hearingType')

  knowVideoLinkRadio = new RadioButtons('cvpRequired')

  get cvpNumberInput(): PageElement<HTMLInputElement> {
    return cy.get('#hmctsNumber')
  }

  get videoLinkUrlInput(): PageElement<HTMLInputElement> {
    return cy.get('#videoLinkUrl')
  }

  guestPinRequiredRadio = new RadioButtons('guestPinRequired')

  get guestPinInput(): PageElement<HTMLInputElement> {
    return cy.get('#guestPin')
  }

  submit(): Cypress.Chainable {
    return cy.get('.govuk-button').contains('Save and continue').click()
  }
}

export default { PrePostAppointmentPage }
