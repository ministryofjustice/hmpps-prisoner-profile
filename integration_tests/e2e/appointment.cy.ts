import Page from '../pages/page'
import { AddAppointmentPage } from '../pages/addAppointmentPage'
import type VideoLinkReferenceCode from '../../server/data/interfaces/bookAVideoLinkApi/ReferenceCode'
import type ReferenceCode from '../../server/data/interfaces/prisonApi/ReferenceCode'
import type PrisonerSchedule from '../../server/data/interfaces/prisonApi/PrisonerSchedule'
import { appointmentTypesMock } from '../../server/data/localMockData/appointmentTypesMock'
import {
  courtEventPrisonerSchedulesMock,
  prisonerSchedulesMock,
} from '../../server/data/localMockData/prisonerSchedulesMock'
import { probationMeetingTypes } from '../../server/data/localMockData/courtHearingsMock'

const visitAddAppointmentPage = () => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/add-appointment' })
  return Page.verifyOnPage(AddAppointmentPage)
}

context('Add an appointment', () => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const todayDisplay = today.split('-').reverse().join('/')

  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber, bookingId })

    cy.task('stubPrisonerData', { prisonerNumber })
    cy.task('stubBookAVideoLinkProbationTeams')
    cy.task('stubBookAVideoLinkReferenceCodes', { group: 'PROBATION_MEETING_TYPE', response: meetingTypes })
    cy.task('stubGetLocationsForAppointments', { prisonId: 'MDI' })
    cy.task('stubGetAppointmentTypes', { response: appointmentTypes })
    stubSchedules({
      prisonerNumber,
      today,
      courtEvents: courtEventPrisonerSchedulesMock,
      externalTransfers: prisonerSchedulesMock,
    })
    cy.task('stubSentencesForOffenders', { offenderNumbers: [prisonerNumber] })
  })

  it('should display different sections depending on appointment type', () => {
    const page = visitAddAppointmentPage()

    // no appointment type is selected

    page.typeOfAppointmentField.options.should('deep.equal', [
      { label: 'Select appointment type', value: '', selected: true },
      { label: 'Activities', value: 'ACTI', selected: false },
      { label: 'Adjudication Review', value: 'OIC', selected: false },
      { label: 'Video Link - Court Hearing', value: 'VLB', selected: false },
      { label: 'Video Link - Legal Appointment', value: 'VLLA', selected: false },
      { label: 'Video Link - Probation Meeting', value: 'VLPM', selected: false },
    ])
    page.probationTeamField.options.should('deep.equal', [
      { label: 'Select probation team', value: '', selected: true },
      { label: 'Blackpool', value: 'ABC', selected: false },
      { label: 'Barnsley', value: 'DEF', selected: false },
      { label: 'Sheffield', value: 'SHF', selected: false },
    ])
    page.locationField.options.should('deep.equal', [
      { label: 'Select location', value: '', selected: true },
      { label: 'Local name one', value: 'location-1', selected: false },
      { label: 'Local name two', value: 'location-2', selected: false },
    ])

    page.probationMeetingFieldsShouldBeHiden()
    page.meetingTypeSelect.element.should('not.exist')

    page.dateField.should('have.value', todayDisplay)

    page.offenderEventsTable.container.should('be.visible')
    page.offenderEventsTable.title.should('equal', 'John Saunders’ schedule')
    page.offenderEventsTable.eventsList.should('deep.equal', [
      { time: '', description: '**Court visit scheduled**' },
      { time: '10:00 to 11:00', description: 'Court - Court - Comment' },
    ])
    page.locationEventsTable.container.should('be.hidden')

    page.startTime.should('equal', ':')
    page.endTime.should('equal', ':')

    page.recurringRadioButtons.fieldset.should('be.visible')
    page.recurringRadioButtons.options.should('deep.equal', [
      { label: 'Yes', value: 'yes', selected: false },
      { label: 'No', value: 'no', selected: false },
    ])

    page.commentsTextArea.should('be.visible')
    page.commentsHint.should('contain.text', 'Comments will appear on prisoner movement slips')
    page.notesForStaffTextArea.should('be.hidden')
    page.notesForStaffHint.should('be.hidden')
    page.notesForPrisonersTextArea.should('be.hidden')
    page.notesForPrisonersHint.should('be.hidden')

    // select a location

    stubLocation(today)
    page.locationField.select('Local name two')
    page.locationEventsTable.container.should('be.visible')
    page.locationEventsTable.title.should('equal', 'Schedule for Local name two')

    // select a normal appointment type

    page.typeOfAppointmentField.select('Activities')
    page.probationMeetingFieldsShouldBeHiden()
    page.recurringRadioButtons.fieldset.should('be.visible')
    page.commentsTextArea.should('be.visible')
    page.commentsHint.should('contain.text', 'Comments will appear on prisoner movement slips')
    page.notesForStaffTextArea.should('be.hidden')
    page.notesForStaffHint.should('be.hidden')
    page.notesForPrisonersTextArea.should('be.hidden')
    page.notesForPrisonersHint.should('be.hidden')

    // select video legal appointment

    page.typeOfAppointmentField.select('Video Link - Legal Appointment')
    page.probationMeetingFieldsShouldBeHiden()
    page.recurringRadioButtons.fieldset.should('be.visible')
    page.commentsTextArea.should('be.visible')
    page.commentsHint.should(
      'contain.text',
      'For confidentiality reasons, comments will not appear on prisoner movement slips',
    )
    page.notesForStaffTextArea.should('be.hidden')
    page.notesForStaffHint.should('be.hidden')
    page.notesForPrisonersTextArea.should('be.hidden')
    page.notesForPrisonersHint.should('be.hidden')

    // select video court hearing

    page.typeOfAppointmentField.select('Video Link - Court Hearing')
    page.probationMeetingFieldsShouldBeHiden()
    page.recurringRadioButtons.fieldset.should('be.hidden')
    page.commentsTextArea.should('be.hidden')
    page.commentsHint.should('contain.text', 'Comments will appear on prisoner movement slips')
    page.notesForStaffTextArea.should('be.visible')
    page.notesForStaffHint.should('be.visible').and('contain.text', 'This can include case number')
    page.notesForPrisonersTextArea.should('be.visible')
    page.notesForPrisonersHint.should('be.visible').and('contain.text', 'Add information the prisoner needs to know')

    // select video probation meeting

    page.typeOfAppointmentField.select('Video Link - Probation Meeting')
    page.probationTeamField.element.should('be.visible')
    page.recurringRadioButtons.fieldset.should('be.hidden')
    page.commentsTextArea.should('be.hidden')
    page.commentsHint.should('contain.text', 'Comments will appear on prisoner movement slips')
    page.notesForStaffTextArea.should('be.visible')
    page.notesForStaffHint
      .should('be.visible')
      .and('contain.text', 'This can include any additional information the prison staff')
    page.notesForPrisonersTextArea.should('be.visible')
    page.notesForPrisonersHint.should('be.visible').and('contain.text', 'Add information the prisoner needs to know')

    page.officerDetailsNotKnownCheckbox.container.should('be.visible')
    page.officerFullNameInput.should('be.visible')
    page.officerEmailInput.should('be.visible')
    page.officerTelephoneInput.should('be.visible')
    page.meetingTypeRadioButtons.fieldset.should('be.visible')
    page.meetingTypeRadioButtons.options.should('deep.equal', [
      { label: 'Post-sentence report', value: 'PSR', selected: false },
      { label: 'Parole Report', value: 'PR', selected: false },
      { label: 'HDC (home detention curfew)', value: 'HDC', selected: false },
    ])
  })
})

const meetingTypes: VideoLinkReferenceCode[] = [
  ...probationMeetingTypes,
  {
    referenceCodeId: 2,
    groupCode: 'PROBATION_MEETING_TYPE',
    code: 'PR',
    description: 'Parole Report',
  },
  {
    referenceCodeId: 3,
    groupCode: 'PROBATION_MEETING_TYPE',
    code: 'HDC',
    description: 'HDC (home detention curfew)',
  },
]

const appointmentTypes: ReferenceCode[] = [
  ...appointmentTypesMock.filter(referenceCode => !referenceCode.code.startsWith('V')),
  {
    code: 'VLB',
    description: 'Video Link - Court Hearing',
    activeFlag: 'Y',
    systemDataFlag: 'Y',
    subCodes: [],
  },
  {
    code: 'VLLA',
    description: 'Video Link - Legal Appointment',
    activeFlag: 'Y',
    systemDataFlag: 'Y',
    subCodes: [],
  },
  {
    code: 'VLPM',
    description: 'Video Link - Probation Meeting',
    activeFlag: 'Y',
    systemDataFlag: 'Y',
    subCodes: [],
  },
]

function stubSchedules({
  prisonerNumber,
  today,
  appointments,
  activities,
  courtEvents,
  externalTransfers,
  visits,
}: {
  prisonerNumber: string
  today: string
  appointments?: PrisonerSchedule[]
  activities?: PrisonerSchedule[]
  courtEvents?: PrisonerSchedule[]
  externalTransfers?: PrisonerSchedule[]
  visits?: PrisonerSchedule[]
}) {
  cy.task('stubSchedulesForOffenders', {
    agencyId: 'MDI',
    offenderNumbers: [prisonerNumber],
    schedule: 'appointments',
    response: appointments ?? [],
  })
  cy.task('stubSchedulesForOffenders', {
    agencyId: 'MDI',
    offenderNumbers: [prisonerNumber],
    schedule: 'activities',
    response: activities ?? [],
  })
  cy.task('stubSchedulesForOffenders', {
    agencyId: 'MDI',
    offenderNumbers: [prisonerNumber],
    schedule: 'courtEvents',
    response: courtEvents ?? [],
    date: today,
  })
  cy.task('stubSchedulesForOffenders', {
    agencyId: 'MDI',
    offenderNumbers: [prisonerNumber],
    schedule: 'externalTransfers',
    response: externalTransfers ?? [],
    date: today,
  })
  cy.task('stubSchedulesForOffenders', {
    agencyId: 'MDI',
    offenderNumbers: [prisonerNumber],
    schedule: 'visits',
    response: visits ?? [],
  })
}

function stubLocation(date: string) {
  cy.task('stubGetMappingUsingDpsLocationId', 'location-2')
  cy.task('stubGetLocation', {
    dpsLocationId: 'location-2',
    response: { id: 'location-2', localName: 'Local name two', key: 'ABC' },
  })
  cy.task('stubActivitiesAtLocation', { locationId: 25762, date })
  cy.task('stubActivityList', { agencyId: 'MDI', locationId: 25762, date, usage: 'VISIT', response: [] })
  cy.task('stubActivityList', { agencyId: 'MDI', locationId: 25762, date, usage: 'APP', response: [] })
}
