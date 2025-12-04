import { addDays } from 'date-fns'

import Page from '../pages/page'
import { AppointmentPage } from '../pages/appointments/appointmentPage'
import { ConfirmationPage } from '../pages/appointments/confirmationPage'
import { MovementSlip } from '../pages/appointments/movementSlip'
import { formatDate } from '../../server/utils/dateHelpers'
import type VideoLinkReferenceCode from '../../server/data/interfaces/bookAVideoLinkApi/ReferenceCode'
import type ReferenceCode from '../../server/data/interfaces/prisonApi/ReferenceCode'
import type PrisonerSchedule from '../../server/data/interfaces/prisonApi/PrisonerSchedule'
import { appointmentTypesMock } from '../../server/data/localMockData/appointmentTypesMock'
import {
  courtEventPrisonerSchedulesMock,
  prisonerSchedulesMock,
} from '../../server/data/localMockData/prisonerSchedulesMock'
import { offenderSentenceDetailsMock } from '../../server/data/localMockData/offenderSentenceDetailsMock'
import { probationMeetingTypes } from '../../server/data/localMockData/courtHearingsMock'
import { probationBookingMock } from '../../server/data/localMockData/videoLinkBookingMock'

const visitAppointmentPage = (appointmentId?: number) => {
  cy.signIn({
    redirectPath: appointmentId
      ? `/prisoner/G6123VU/edit-appointment/${appointmentId}`
      : '/prisoner/G6123VU/add-appointment',
  })
  return Page.verifyOnPage(AppointmentPage, appointmentId)
}

context('Appointment page', () => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const todayDisplay = today.split('-').reverse().join('/')
  const tomorrow = addDays(now, 1).toISOString().split('T')[0]
  const tomorrowDisplay = tomorrow.split('-').reverse().join('/')

  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber, bookingId })

    cy.task('stubBanner')
    cy.task('stubPrisonerData', { prisonerNumber })
    cy.task('stubBookAVideoLinkProbationTeams')
    cy.task('stubBookAVideoLinkReferenceCodes', { group: 'PROBATION_MEETING_TYPE', response: meetingTypes })
    cy.task('stubGetLocationsForAppointments', { prisonId: 'MDI' })
    cy.task('stubGetAppointmentTypes', { response: appointmentTypes })
    stubSchedules({ prisonerNumber, date: today })
    cy.task('stubSentencesForOffenders', { offenderNumbers: [prisonerNumber] })
  })

  it('should display different sections depending on appointment type', () => {
    const page = visitAppointmentPage()

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

    page.appointmentSummary.element.should('not.exist')

    page.dateField.should('have.value', todayDisplay)

    page.offenderEventsTable.container.should('be.visible')
    page.offenderEventsTable.title.should('equal', 'John Saunders’ schedule')
    page.offenderEventsTable.noEventsComment.should('be.visible')
    page.offenderEventsTable.eventsDivs.should('not.exist')
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

  context('prisoner’s events', () => {
    for (const scheduleKey of ['appointments', 'activities', 'externalTransfers', 'visits'] as const) {
      it(`should list ${scheduleKey} schedule`, () => {
        stubSchedules({
          prisonerNumber,
          date: today,
          [scheduleKey]: [
            {
              ...prisonerSchedulesMock[0],
              eventDescription: 'Some activity',
              eventLocation: 'Place 1',
              comment: 'some notes',
            },
          ],
        })
        const page = visitAppointmentPage()
        page.offenderEventsTable.container.should('be.visible')
        page.offenderEventsTable.noEventsComment.should('not.exist')
        page.offenderEventsTable.eventsList.should('deep.equal', [
          { time: '10:00 to 11:00', description: 'Place 1 - Some activity - some notes' },
        ])
      })
    }

    it('should list open-ended schedule', () => {
      stubSchedules({
        prisonerNumber,
        date: today,
        activities: [
          {
            ...prisonerSchedulesMock[0],
            startTime: `${today}T12:00:00`,
            endTime: undefined,
            eventDescription: 'Some activity',
            eventLocation: 'Place 1',
            comment: undefined,
          },
        ],
      })
      const page = visitAppointmentPage()
      page.offenderEventsTable.container.should('be.visible')
      page.offenderEventsTable.noEventsComment.should('not.exist')
      page.offenderEventsTable.eventsList.should('deep.equal', [
        { time: '12:00', description: 'Place 1 - Some activity' },
      ])
    })

    it('should not list courtEvents schedule, but indicate there is one', () => {
      stubSchedules({
        prisonerNumber,
        date: today,
        courtEvents: courtEventPrisonerSchedulesMock,
      })
      const page = visitAppointmentPage()
      page.offenderEventsTable.container.should('be.visible')
      page.offenderEventsTable.noEventsComment.should('not.exist')
      page.offenderEventsTable.eventsList.should('deep.equal', [{ time: '', description: '**Court visit scheduled**' }])
    })

    it('should indicate when due for release today', () => {
      const mockData = offenderSentenceDetailsMock[0]
      cy.task('stubSentencesForOffenders', {
        offenderNumbers: [prisonerNumber],
        response: [{ ...mockData, sentenceDetail: { ...mockData.sentenceDetail, releaseDate: today } }],
      })
      const page = visitAppointmentPage()
      page.offenderEventsTable.container.should('be.visible')
      page.offenderEventsTable.noEventsComment.should('not.exist')
      page.offenderEventsTable.eventsList.should('deep.equal', [{ time: '', description: '**Due for release**' }])
    })
  })

  it('should show probation meeting types as a drop-down when there are more than 3', () => {
    cy.task('stubBookAVideoLinkReferenceCodes', {
      group: 'PROBATION_MEETING_TYPE',
      response: [
        ...meetingTypes,
        {
          referenceCodeId: 4,
          groupCode: 'PROBATION_MEETING_TYPE',
          code: 'PRP',
          description: 'Pre-release planning',
        },
      ],
    })

    const page = visitAppointmentPage()

    page.meetingTypeRadioButtons.inputElements.should('not.exist')
    page.meetingTypeSelect.element.should('be.hidden')

    page.typeOfAppointmentField.select('Video Link - Probation Meeting')
    page.meetingTypeSelect.element.should('be.visible')
    page.meetingTypeSelect.options.should('deep.equal', [
      { label: 'Select meeting type', value: '', selected: true },
      { label: 'Post-sentence report', value: 'PSR', selected: false },
      { label: 'Parole Report', value: 'PR', selected: false },
      { label: 'HDC (home detention curfew)', value: 'HDC', selected: false },
      { label: 'Pre-release planning', value: 'PRP', selected: false },
    ])
  })

  const successScenarios: (Scenario<AppointmentPage, ConfirmationPage> & MovementSlipScenario)[] = [
    {
      scenarioName: 'OIC',
      setupScenario: page => {
        page.typeOfAppointmentField.select('Adjudication Review')
        page.locationField.select('Local name two')
        page.dateField.clear().type(tomorrowDisplay)
        page.selectStartTime('11', '05')
        page.selectEndTime('12', '15')
        page.recurringRadioButtons.selectOption('No')
        page.commentsTextArea.type('Comment x')

        cy.task('stubCreateAppointment', {
          request: {
            bookingId: 1102484,
            appointmentType: 'OIC',
            locationId: 25762,
            startTime: `${tomorrow}T11:05:00`,
            endTime: `${tomorrow}T12:15:00`,
            comment: 'Comment x',
          },
        })
      },
      expectations: page => {
        page.summaryListCommon.rows.then(rows => {
          expect(rows).to.have.length(5)
          expect(rows[0]).to.contain({ key: 'Type', value: 'Adjudication Review' })
          expect(rows[1]).to.contain({ key: 'Location', value: 'Local name two' })
          expect(rows[2]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
          expect(rows[3]).to.contain({ key: 'Start time', value: '11:05' })
          expect(rows[4]).to.contain({ key: 'End time', value: '12:15' })
        })
        page.summaryListComments.rows.then(rows => {
          expect(rows).to.have.length(1)
          expect(rows[0]).to.contain({ key: 'Comment', value: 'Comment x' })
        })
        page.summaryListRecurring.element.should('not.exist')
        page.summaryListProbation.element.should('not.exist')
      },
      movementSlipExpectation: {
        dateAndTime: `${formatDate(tomorrow, 'long')} 11:05 to 12:15`,
        reason: 'Adjudication Review',
        comments: 'Comment x',
      },
    },
    {
      scenarioName: 'VLLA',
      setupScenario: page => {
        page.typeOfAppointmentField.select('Video Link - Legal Appointment')
        page.locationField.select('Local name two')
        page.dateField.clear().type(tomorrowDisplay)
        page.selectStartTime('14', '00')
        page.selectEndTime('15', '00')
        page.recurringRadioButtons.selectOption('No')
        page.commentsTextArea.type('Some notes')

        cy.task('stubCreateAppointment', {
          request: {
            bookingId: 1102484,
            appointmentType: 'VLLA',
            locationId: 25762,
            startTime: `${tomorrow}T14:00:00`,
            endTime: `${tomorrow}T15:00:00`,
            comment: 'Some notes',
          },
        })
      },
      expectations: page => {
        page.summaryListCommon.rows.then(rows => {
          expect(rows).to.have.length(5)
          expect(rows[0]).to.contain({ key: 'Type', value: 'Video Link - Legal Appointment' })
          expect(rows[1]).to.contain({ key: 'Location', value: 'Local name two' })
          expect(rows[2]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
          expect(rows[3]).to.contain({ key: 'Start time', value: '14:00' })
          expect(rows[4]).to.contain({ key: 'End time', value: '15:00' })
        })
        page.summaryListComments.rows.then(rows => {
          expect(rows).to.have.length(1)
          expect(rows[0]).to.contain({ key: 'Comment', value: 'Some notes' })
        })
        page.summaryListRecurring.element.should('not.exist')
        page.summaryListProbation.element.should('not.exist')
      },
      movementSlipExpectation: {
        dateAndTime: `${formatDate(tomorrow, 'long')} 14:00 to 15:00`,
        reason: 'Video Link - Legal Appointment',
      },
    },
    {
      scenarioName: 'VLPM',
      setupScenario: page => {
        page.typeOfAppointmentField.select('Video Link - Probation Meeting')
        page.probationTeamField.select('Blackpool')
        page.officerFullNameInput.type('Officer name')
        page.officerEmailInput.type('officer@example.com')
        page.officerTelephoneInput.type('02000000000')
        page.meetingTypeRadioButtons.selectOption('Parole Report')
        page.locationField.select('Local name two')
        page.dateField.clear().type(tomorrowDisplay)
        page.selectStartTime('17', '30')
        page.selectEndTime('18', '30')
        page.notesForStaffTextArea.type('Staff info')
        page.notesForPrisonersTextArea.type('Prisoner note')

        cy.task('stubBookAVideoLinkCreateBooking', {
          createRequest: {
            bookingType: 'PROBATION',
            prisoners: [
              {
                prisonCode: 'MDI',
                prisonerNumber: 'G6123VU',
                appointments: [
                  {
                    type: 'VLB_PROBATION',
                    locationKey: 'ABC',
                    date: tomorrow,
                    startTime: '17:30',
                    endTime: '18:30',
                  },
                ],
              },
            ],
            probationTeamCode: 'ABC',
            probationMeetingType: 'PR',
            additionalBookingDetails: {
              contactName: 'Officer name',
              contactEmail: 'officer@example.com',
              contactNumber: '02000000000',
            },
            notesForStaff: 'Staff info',
            notesForPrisoners: 'Prisoner note',
          },
        })
      },
      expectations: page => {
        page.summaryListCommon.rows.then(rows => {
          expect(rows).to.have.length(10)
          expect(rows[0]).to.contain({ key: 'Type', value: 'Video Link - Probation Meeting' })
          expect(rows[1]).to.contain({ key: 'Probation team', value: 'Blackpool' })
          expect(rows[2]).to.contain({ key: 'Location', value: 'Local name two' })
          expect(rows[3]).to.contain({ key: 'Probation officer’s full name', value: 'Officer name' })
          expect(rows[4]).to.contain({ key: 'Email address', value: 'officer@example.com' })
          expect(rows[5]).to.contain({ key: 'UK phone number', value: '02000000000' })
          expect(rows[6]).to.contain({ key: 'Meeting type', value: 'Parole Report' })
          expect(rows[7]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
          expect(rows[8]).to.contain({ key: 'Start time', value: '17:30' })
          expect(rows[9]).to.contain({ key: 'End time', value: '18:30' })
        })
        page.summaryListProbation.rows.then(rows => {
          expect(rows).to.have.length(2)
          expect(rows[0]).to.contain({ key: 'Notes for prison staff', value: 'Staff info' })
          expect(rows[1]).to.contain({ key: 'Notes for prisoner', value: 'Prisoner note' })
        })
        page.summaryListRecurring.element.should('not.exist')
        page.summaryListComments.element.should('not.exist')
      },
      movementSlipExpectation: {
        dateAndTime: `${formatDate(tomorrow, 'long')} 17:30 to 18:30`,
        reason: 'Video Link - Probation Meeting',
        comments: 'Prisoner note',
      },
    },
  ]
  for (const { scenarioName, setupScenario, expectations, movementSlipExpectation } of successScenarios) {
    it(`should allow adding an appointment of type ${scenarioName} and generate a movement slip`, () => {
      stubSchedules({ prisonerNumber, date: tomorrow })
      stubLocation(today)
      stubLocation(tomorrow)
      const addPage = visitAppointmentPage()
      setupScenario(addPage)
      addPage.submit()
      const confirmationPage = Page.verifyOnPage(ConfirmationPage, 'John Saunders’')
      expectations(confirmationPage)

      confirmationPage.addMoreLink.invoke('attr', 'href').should('equal', `/prisoner/${prisonerNumber}/add-appointment`)
      let movemetSlipHref: string
      confirmationPage.movementSlipLink.then($anchor => {
        movemetSlipHref = $anchor.attr('href')
        cy.visit(movemetSlipHref)
      })

      const movementSlip = Page.verifyOnPage(MovementSlip)
      movementSlip.shouldNotShowPageChrome()
      movementSlip.labels
        .should('deep.equal', [
          { title: 'Name', description: 'John Saunders' },
          { title: 'Prison number', description: 'G6123VU' },
          { title: 'Cell location', description: '1-1-035' },
          { title: 'Date and time', description: movementSlipExpectation.dateAndTime },
          { title: 'Moving to', description: 'Local name two' },
          { title: 'Reason', description: movementSlipExpectation.reason },
          { title: 'Comments', description: movementSlipExpectation.comments ?? '--' },
          { title: 'Created by', description: 'John Smith' },
        ])
        .then(() => {
          // cannot load movement slip more than once
          cy.request({ url: movemetSlipHref, failOnStatusCode: false }).its('status').should('equal', 404)
        })
    })
  }

  it('should pre-fill details of an existing appointment', () => {
    cy.task('stubGetAppointment', {
      appointment: {
        appointment: {
          id: 81,
          agencyId: 'MDI',
          locationId: 25762,
          appointmentTypeCode: 'VLPM',
          offenderNo: prisonerNumber,
          startTime: `${today}T12:00:00`,
          endTime: `${today}T13:30:00`,
          comment: 'Comment',
        },
      },
    })
    cy.task('stubGetMappingUsingNomisLocationId', { nomisLocationId: 25762, dpsLocationId: 'location-2' })
    stubLocation(today)
    cy.task('stubBookAVideoLinkBooking', {
      searchRequest: {
        prisonerNumber: 'G6123VU',
        locationKey: 'ABC',
        date: today,
        startTime: '12:00',
        endTime: '13:30',
      },
      response: {
        ...probationBookingMock,
        probationTeamCode: 'ABC',
        prisonAppointments: [
          {
            ...probationBookingMock.prisonAppointments[0],
            appointmentDate: today,
            startTime: '12:00',
            endTime: '13:30',
          },
        ],
      },
    })
    cy.task('stubGetLocationByKey', {
      key: 'ABC',
      response: { id: 'location-2', localName: 'Local name two', key: 'ABC' },
    })

    const page = visitAppointmentPage(81)
    page.appointmentSummary.rows.then(rows => {
      expect(rows).to.have.length(2)
      expect(rows[0]).to.contain({ key: 'Type of appointment', value: 'Video Link - Probation Meeting' })
      expect(rows[1]).to.contain({ key: 'Probation team', value: 'Blackpool' })
    })
    page.locationField.value.should('equal', 'location-2')
    page.officerFullNameInput.should('have.value', 'Test name')
    page.officerEmailInput.should('have.value', 'Test email')
    page.officerTelephoneInput.should('have.value', 'Test number')
    page.meetingTypeRadioButtons.value.should('equal', 'PSR')
    page.dateField.should('have.value', todayDisplay)
    page.startTime.should('equal', '12:00')
    page.endTime.should('equal', '13:30')
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
  date,
  appointments,
  activities,
  courtEvents,
  externalTransfers,
  visits,
}: {
  prisonerNumber: string
  date: string
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
    date,
  })
  cy.task('stubSchedulesForOffenders', {
    agencyId: 'MDI',
    offenderNumbers: [prisonerNumber],
    schedule: 'externalTransfers',
    response: externalTransfers ?? [],
    date,
  })
  cy.task('stubSchedulesForOffenders', {
    agencyId: 'MDI',
    offenderNumbers: [prisonerNumber],
    schedule: 'visits',
    response: visits ?? [],
  })
}

function stubLocation(date: string) {
  cy.task('stubGetMappingUsingDpsLocationId', { dpsLocationId: 'location-2' })
  cy.task('stubGetLocation', {
    dpsLocationId: 'location-2',
    response: { id: 'location-2', localName: 'Local name two', key: 'ABC' },
  })
  cy.task('stubActivitiesAtLocation', { locationId: 25762, date })
  cy.task('stubActivityList', { agencyId: 'MDI', locationId: 25762, date, usage: 'VISIT', response: [] })
  cy.task('stubActivityList', { agencyId: 'MDI', locationId: 25762, date, usage: 'APP', response: [] })
}

interface Scenario<P1 extends Page, P2 extends Page> {
  scenarioName: string
  setupScenario: (page: P1) => void
  expectations: (page: P2) => void
}

interface MovementSlipScenario {
  movementSlipExpectation: {
    dateAndTime: string
    reason: string
    comments?: string
  }
}
