import Page, { type PageElement } from './page'
import { SelectElement } from './pageElements/selectElement'
import { ScheduledEventsTable } from './pageElements/scheduledEventsTable'
import { RadioButtons } from './pageElements/radioButtons'
import { Checkboxes } from './pageElements/checkboxes'

export class AddAppointmentPage extends Page {
  constructor() {
    super('Add an appointment')
  }

  typeOfAppointmentField = new SelectElement('#appointmentType')

  probationTeamField = new SelectElement('#probationTeam')

  locationField = new SelectElement('#location')

  officerDetailsNotKnownCheckbox = new Checkboxes('officerDetailsNotKnown')

  get officerFullNameInput(): PageElement<HTMLInputElement> {
    return cy.get('#officerFullName')
  }

  get officerEmailInput(): PageElement<HTMLInputElement> {
    return cy.get('#officerEmail')
  }

  get officerTelephoneInput(): PageElement<HTMLInputElement> {
    return cy.get('#officerTelephone')
  }

  meetingTypeRadioButtons = new RadioButtons('meetingType')

  meetingTypeSelect = new SelectElement('select#meetingType')

  probationMeetingFieldsShouldBeHiden(): Cypress.Chainable {
    this.probationTeamField.element.should('be.hidden')
    this.officerDetailsNotKnownCheckbox.container.should('be.hidden')
    this.officerFullNameInput.should('be.hidden')
    this.officerEmailInput.should('be.hidden')
    this.officerTelephoneInput.should('be.hidden')
    return this.meetingTypeRadioButtons.fieldset.should('be.hidden').end()
  }

  get dateField(): PageElement<HTMLInputElement> {
    return cy.get('#date')
  }

  startTimeHoursField = new SelectElement('#startTime-hours')

  startTimeMinutesField = new SelectElement('#startTime-hours')

  get startTime(): Cypress.Chainable<string> {
    return this.startTimeHoursField.value.then(hours =>
      this.startTimeMinutesField.value.then(minutes => `${hours}:${minutes}`),
    )
  }

  endTimeHoursField = new SelectElement('#endTime-hours')

  endTimeMinutesField = new SelectElement('#endTime-hours')

  get endTime(): Cypress.Chainable<string> {
    return this.endTimeHoursField.value.then(hours =>
      this.endTimeMinutesField.value.then(minutes => `${hours}:${minutes}`),
    )
  }

  offenderEventsTable = new ScheduledEventsTable('#offender-events')

  locationEventsTable = new ScheduledEventsTable('#location-events')

  recurringRadioButtons = new RadioButtons('recurring')

  get commentsTextArea(): PageElement<HTMLTextAreaElement> {
    return cy.get('#comments')
  }

  get commentsHint(): PageElement<HTMLDivElement> {
    return cy.get('#comments-hint')
  }

  get notesForStaffTextArea(): PageElement<HTMLTextAreaElement> {
    return cy.get('#notesForStaff')
  }

  get notesForStaffHint(): PageElement<HTMLDivElement> {
    return cy.get('#notesForStaff-hint')
  }

  get notesForPrisonersTextArea(): PageElement<HTMLTextAreaElement> {
    return cy.get('#notesForPrisoners')
  }

  get notesForPrisonersHint(): PageElement<HTMLDivElement> {
    return cy.get('#notesForPrisoners-hint')
  }
}

export default { AddAppointmentPage }
