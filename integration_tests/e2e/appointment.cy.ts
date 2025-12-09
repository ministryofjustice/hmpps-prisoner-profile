import { addDays, addWeeks } from 'date-fns'

import Page from '../pages/page'
import { AppointmentPage } from '../pages/appointments/appointmentPage'
import { ConfirmationPage } from '../pages/appointments/confirmationPage'
import { PrePostAppointmentPage } from '../pages/appointments/prePostAppointmentPage'
import { PrePostConfirmationPage } from '../pages/appointments/prePostConfirmationPage'
import { MovementSlip } from '../pages/appointments/movementSlip'
import { formatDate } from '../../server/utils/dateHelpers'
import type VideoLinkReferenceCode from '../../server/data/interfaces/bookAVideoLinkApi/ReferenceCode'
import type ReferenceCode from '../../server/data/interfaces/prisonApi/ReferenceCode'
import type PrisonerSchedule from '../../server/data/interfaces/prisonApi/PrisonerSchedule'
import type CreateVideoBookingRequest from '../../server/data/interfaces/bookAVideoLinkApi/VideoLinkBooking'
import type { AppointmentDefaults } from '../../server/data/interfaces/whereaboutsApi/Appointment'
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

const now = new Date()
const today = now.toISOString().split('T')[0]
const todayDisplay = today.split('-').reverse().join('/')
const tomorrow = addDays(now, 1).toISOString().split('T')[0]
const tomorrowDisplay = tomorrow.split('-').reverse().join('/')

const prisonerNumber = 'G6123VU'
const bookingId = 1102484

context('Appointments pages', () => {
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
    stubSchedules({ date: today })
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
    page.offenderEventsTable.noEventsComment.should('be.visible').and('contain.text', 'Nothing scheduled on')
    page.offenderEventsTable.eventsDivs.should('not.exist')
    page.locationEventsTable.container.should('be.hidden')

    page.startTime.should('equal', ':')
    page.endTime.should('equal', ':')

    page.recurringRadioButtons.fieldset.should('be.visible')
    page.recurringRadioButtons.options.should('deep.equal', [
      { label: 'Yes', value: 'yes', selected: false },
      { label: 'No', value: 'no', selected: false },
    ])
    page.recurringPeriodField.element.should('be.hidden')
    page.recurringCountInput.should('be.hidden')
    page.lastRecurringAppointmentDate.should('be.hidden')

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
    page.locationEventsTable.noEventsComment.should('be.visible').and('contain.text', 'Nothing scheduled on')
    page.locationEventsTable.eventsDivs.should('not.exist')

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

  context('prisoner’s schedule', () => {
    const nonCourtSchedules = ['appointments', 'activities', 'externalTransfers', 'visits'] as const

    for (const scheduleKey of nonCourtSchedules) {
      it(`should list ${scheduleKey} events`, () => {
        stubSchedules({
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

    it('should list multiple events', () => {
      const schedules = nonCourtSchedules.map((scheduleKey, index) => [
        scheduleKey,
        [
          {
            ...prisonerSchedulesMock[0],
            startTime: `${today}T${10 + index}:00:00`,
            endTime: `${today}T${11 + index}:00:00`,
            eventDescription: `${scheduleKey} event`,
            eventLocation: `Place ${index + 1}`,
            comment: `some notes ${index + 1}`,
          },
        ],
      ])
      stubSchedules({
        date: today,
        ...Object.fromEntries(schedules),
      })
      const page = visitAppointmentPage()
      page.offenderEventsTable.container.should('be.visible')
      page.offenderEventsTable.noEventsComment.should('not.exist')
      page.offenderEventsTable.eventsList.should('deep.equal', [
        { time: '10:00 to 11:00', description: 'Place 1 - appointments event - some notes 1' },
        { time: '11:00 to 12:00', description: 'Place 2 - activities event - some notes 2' },
        { time: '12:00 to 13:00', description: 'Place 3 - externalTransfers event - some notes 3' },
        { time: '13:00 to 14:00', description: 'Place 4 - visits event - some notes 4' },
      ])
    })

    it('should list open-ended events', () => {
      stubSchedules({
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

    it('should not list courtEvents events, but indicate court visit is planned', () => {
      stubSchedules({
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

  context('selected location’s schedule', () => {
    let page: AppointmentPage

    beforeEach(() => {
      page = visitAppointmentPage()
      stubLocation(today)
    })

    it('should list activities', () => {
      cy.task('stubActivitiesAtLocation', {
        locationId: 25762,
        date: today,
        response: [
          {
            ...prisonerSchedulesMock[0],
            eventDescription: 'Some activity',
            eventLocation: 'Place 1',
            comment: 'some notes',
          },
        ],
      })

      page.locationField.select('Local name two')

      page.locationEventsTable.noEventsComment.should('not.exist')
      page.locationEventsTable.eventsList.should('deep.equal', [
        { time: '10:00 to 11:00', description: 'Place 1 - Some activity - some notes' },
      ])
    })

    it('should list multiple events', () => {
      cy.task('stubActivitiesAtLocation', {
        locationId: 25762,
        date: today,
        response: [
          {
            ...prisonerSchedulesMock[0],
            eventDescription: 'Some activity',
            eventLocation: 'Place 1',
            comment: 'some notes',
          },
          {
            ...prisonerSchedulesMock[0],
            startTime: `${today}T13:30:00`,
            endTime: `${today}T14:30:00`,
            eventDescription: 'Elective activity',
            eventLocation: 'Another place',
            comment: 'some more notes',
          },
        ],
      })

      page.locationField.select('Local name two')

      page.locationEventsTable.noEventsComment.should('not.exist')
      page.locationEventsTable.eventsList.should('deep.equal', [
        { time: '10:00 to 11:00', description: 'Place 1 - Some activity - some notes' },
        { time: '13:30 to 14:30', description: 'Another place - Elective activity - some more notes' },
      ])
    })

    it('should list open-ended events', () => {
      cy.task('stubActivitiesAtLocation', {
        locationId: 25762,
        date: today,
        response: [
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

      page.locationField.select('Local name two')

      page.locationEventsTable.noEventsComment.should('not.exist')
      page.locationEventsTable.eventsList.should('deep.equal', [
        { time: '12:00', description: 'Place 1 - Some activity' },
      ])
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

  context('creating simple appointments', () => {
    const expectedCreateRequestOIC: AppointmentDefaults = {
      bookingId: 1102484,
      appointmentType: 'OIC',
      locationId: 25762,
      startTime: `${tomorrow}T11:05:00`,
      endTime: `${tomorrow}T12:15:00`,
      comment: 'Comment x',
    }
    const expectedCreateRequestVLLA: AppointmentDefaults = {
      bookingId: 1102484,
      appointmentType: 'VLLA',
      locationId: 25762,
      startTime: `${tomorrow}T14:00:00`,
      endTime: `${tomorrow}T15:00:00`,
      comment: 'Some notes',
    }
    const expectedCreateRequestVLPM: CreateVideoBookingRequest = {
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
    }

    const successScenarios: (Scenario<AppointmentPage, ConfirmationPage> & MovementSlipScenario)[] = [
      {
        scenarioName: 'of type OIC',
        appointmentType: 'OIC',
        setupScenario: page => {
          page.typeOfAppointmentField.select('Adjudication Review')
          page.locationField.select('Local name two')
          page.dateField.clear().type(tomorrowDisplay)
          page.selectStartTime('11', '05')
          page.selectEndTime('12', '15')
          page.recurringRadioButtons.selectOption('No')
          page.commentsTextArea.type('Comment x')

          cy.task('stubCreateAppointment', { request: expectedCreateRequestOIC })
        },
        expectations: page => {
          page.summaryListCommon.rows.then(rows => {
            expect(rows).to.have.lengthOf(5)
            expect(rows[0]).to.contain({ key: 'Type', value: 'Adjudication Review' })
            expect(rows[1]).to.contain({ key: 'Location', value: 'Local name two' })
            expect(rows[2]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
            expect(rows[3]).to.contain({ key: 'Start time', value: '11:05' })
            expect(rows[4]).to.contain({ key: 'End time', value: '12:15' })
          })
          page.summaryListComments.rows.then(rows => {
            expect(rows).to.have.lengthOf(1)
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
        scenarioName: 'of type OIC that’s recurring',
        appointmentType: 'OIC',
        setupScenario: page => {
          page.typeOfAppointmentField.select('Adjudication Review')
          page.locationField.select('Local name two')
          page.dateField.clear().type(tomorrowDisplay)
          page.selectStartTime('11', '05')
          page.selectEndTime('12', '15')
          page.lastRecurringAppointmentDate.should('be.hidden')
          page.recurringRadioButtons.selectOption('Yes')
          page.lastRecurringAppointmentDate.should('be.hidden')
          page.recurringPeriodField.select('Weekly')
          page.lastRecurringAppointmentDate.should('be.hidden')
          page.recurringCountInput.type('3')
          page.lastRecurringAppointmentDate.should('be.visible')
          page.lastRecurringAppointmentDate.should(
            'contain.text',
            formatDate(addWeeks(addDays(now, 1), 2).toISOString(), 'long'),
          )
          page.commentsTextArea.type('Repeats thrice')

          cy.task('stubCreateAppointment', {
            request: {
              ...expectedCreateRequestOIC,
              comment: 'Repeats thrice',
              repeat: { repeatPeriod: 'WEEKLY', count: 3 },
            },
          })
        },
        expectations: page => {
          page.summaryListCommon.rows.then(rows => {
            expect(rows).to.have.lengthOf(5)
            expect(rows[0]).to.contain({ key: 'Type', value: 'Adjudication Review' })
            expect(rows[1]).to.contain({ key: 'Location', value: 'Local name two' })
            expect(rows[2]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
            expect(rows[3]).to.contain({ key: 'Start time', value: '11:05' })
            expect(rows[4]).to.contain({ key: 'End time', value: '12:15' })
          })
          page.summaryListRecurring.rows.then(rows => {
            expect(rows).to.have.lengthOf(4)
            expect(rows[0]).to.contain({ key: 'Recurring', value: 'Yes' })
            expect(rows[1]).to.contain({ key: 'Repeats', value: 'Weekly' })
            expect(rows[2]).to.contain({ key: 'Number added', value: '3' })
            expect(rows[3]).to.contain({
              key: 'Last appointment',
              value: formatDate(addWeeks(addDays(now, 1), 2).toISOString(), 'long'),
            })
          })
          page.summaryListComments.rows.then(rows => {
            expect(rows).to.have.lengthOf(1)
            expect(rows[0]).to.contain({ key: 'Comment', value: 'Repeats thrice' })
          })
          page.summaryListProbation.element.should('not.exist')
        },
        movementSlipExpectation: {
          dateAndTime: `${formatDate(tomorrow, 'long')} 11:05 to 12:15`,
          reason: 'Adjudication Review',
          comments: 'Repeats thrice',
        },
      },
      {
        scenarioName: 'of type VLLA',
        appointmentType: 'VLLA',
        setupScenario: page => {
          page.typeOfAppointmentField.select('Video Link - Legal Appointment')
          page.locationField.select('Local name two')
          page.dateField.clear().type(tomorrowDisplay)
          page.selectStartTime('14', '00')
          page.selectEndTime('15', '00')
          page.recurringRadioButtons.selectOption('No')
          page.commentsTextArea.type('Some notes')

          cy.task('stubCreateAppointment', { request: expectedCreateRequestVLLA })
        },
        expectations: page => {
          page.summaryListCommon.rows.then(rows => {
            expect(rows).to.have.lengthOf(5)
            expect(rows[0]).to.contain({ key: 'Type', value: 'Video Link - Legal Appointment' })
            expect(rows[1]).to.contain({ key: 'Location', value: 'Local name two' })
            expect(rows[2]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
            expect(rows[3]).to.contain({ key: 'Start time', value: '14:00' })
            expect(rows[4]).to.contain({ key: 'End time', value: '15:00' })
          })
          page.summaryListComments.rows.then(rows => {
            expect(rows).to.have.lengthOf(1)
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
        scenarioName: 'of type VLPM',
        appointmentType: 'VLPM',
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

          cy.task('stubBookAVideoLinkCreateBooking', { createRequest: expectedCreateRequestVLPM })
        },
        expectations: page => {
          page.summaryListCommon.rows.then(rows => {
            expect(rows).to.have.lengthOf(10)
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
            expect(rows).to.have.lengthOf(2)
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
      {
        scenarioName: 'of type VLPM with unknown officer',
        appointmentType: 'VLPM',
        setupScenario: page => {
          page.typeOfAppointmentField.select('Video Link - Probation Meeting')
          page.probationTeamField.select('Blackpool')
          page.officerDetailsNotKnownCheckbox.toggleOption('Not yet known')
          page.meetingTypeRadioButtons.selectOption('Parole Report')
          page.locationField.select('Local name two')
          page.dateField.clear().type(tomorrowDisplay)
          page.selectStartTime('17', '30')
          page.selectEndTime('18', '30')
          page.notesForStaffTextArea.type('Staff info')
          page.notesForPrisonersTextArea.type('Prisoner note')

          cy.task('stubBookAVideoLinkCreateBooking', {
            createRequest: { ...expectedCreateRequestVLPM, additionalBookingDetails: undefined },
          })
        },
        expectations: page => {
          page.summaryListCommon.rows.then(rows => {
            expect(rows).to.have.lengthOf(10)
            expect(rows[0]).to.contain({ key: 'Type', value: 'Video Link - Probation Meeting' })
            expect(rows[1]).to.contain({ key: 'Probation team', value: 'Blackpool' })
            expect(rows[2]).to.contain({ key: 'Location', value: 'Local name two' })
            expect(rows[3]).to.contain({ key: 'Probation officer’s full name', value: 'Not yet known' })
            expect(rows[4]).to.contain({ key: 'Email address', value: 'Not yet known' })
            expect(rows[5]).to.contain({ key: 'UK phone number', value: 'Not yet known' })
            expect(rows[6]).to.contain({ key: 'Meeting type', value: 'Parole Report' })
            expect(rows[7]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
            expect(rows[8]).to.contain({ key: 'Start time', value: '17:30' })
            expect(rows[9]).to.contain({ key: 'End time', value: '18:30' })
          })
          page.summaryListProbation.rows.then(rows => {
            expect(rows).to.have.lengthOf(2)
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
    for (const {
      scenarioName,
      appointmentType,
      setupScenario,
      expectations,
      movementSlipExpectation,
    } of successScenarios) {
      context(scenarioName, () => {
        const multipleAppointments = scenarioName.includes('recurring')

        it('should save appointment and generate a movement slip', () => {
          stubSchedules({ date: tomorrow })
          stubLocation(today)
          stubLocation(tomorrow)

          const addPage = visitAppointmentPage()
          setupScenario(addPage)
          addPage.submit()

          const confirmationPage = Page.verifyOnPage(ConfirmationPage, 'John Saunders’', multipleAppointments)
          expectations(confirmationPage)

          confirmationPage.addMoreLink
            .invoke('attr', 'href')
            .should('equal', `/prisoner/${prisonerNumber}/add-appointment`)
          let movementSlipUrl: string
          confirmationPage.movementSlipLink.then($anchor => {
            movementSlipUrl = $anchor.attr('href')
            cy.visit(movementSlipUrl)
          })
          expectCorrectMovementSlip(movementSlipExpectation).then(() => {
            // cannot load movement slip more than once
            cy.request({ url: movementSlipUrl, failOnStatusCode: false }).its('status').should('equal', 404)
          })
        })

        it('should save appointment without comments', () => {
          stubSchedules({ date: tomorrow })
          stubLocation(today)
          stubLocation(tomorrow)

          // override creation stub
          if (appointmentType === 'OIC') {
            if (multipleAppointments) {
              cy.task('stubCreateAppointment', {
                request: { ...expectedCreateRequestOIC, repeat: { repeatPeriod: 'WEEKLY', count: 3 }, comment: '' },
              })
            } else {
              cy.task('stubCreateAppointment', {
                request: { ...expectedCreateRequestOIC, comment: '' },
              })
            }
          } else if (appointmentType === 'VLLA') {
            cy.task('stubCreateAppointment', {
              request: { ...expectedCreateRequestVLLA, comment: '' },
            })
          } else if (appointmentType === 'VLPM') {
            const expectedCreateRequestVLPM2 = { ...expectedCreateRequestVLPM }
            delete expectedCreateRequestVLPM2.notesForStaff
            delete expectedCreateRequestVLPM2.notesForPrisoners
            if (scenarioName.includes('unknown officer')) {
              delete expectedCreateRequestVLPM2.additionalBookingDetails
            }
            cy.task('stubBookAVideoLinkCreateBooking', {
              createRequest: expectedCreateRequestVLPM2,
            })
          }

          const addPage = visitAppointmentPage()
          setupScenario(addPage)
          if (appointmentType === 'VLPM') {
            addPage.notesForStaffTextArea.clear()
            addPage.notesForPrisonersTextArea.clear()
          } else {
            addPage.commentsTextArea.clear()
          }
          addPage.submit()

          const confirmationPage = Page.verifyOnPage(ConfirmationPage, 'John Saunders’', multipleAppointments)
          if (appointmentType === 'VLPM') {
            confirmationPage.summaryListProbation.rows.then(rows => {
              expect(rows).to.have.lengthOf(2)
              expect(rows[0]).to.contain({ key: 'Notes for prison staff', value: 'None entered' })
              expect(rows[1]).to.contain({ key: 'Notes for prisoner', value: 'None entered' })
            })
          } else {
            confirmationPage.summaryListComments.rows.then(rows => {
              expect(rows).to.have.lengthOf(1)
              expect(rows[0]).to.contain({ key: 'Comment', value: '' })
            })
          }
        })
      })
    }
  })

  context('creating appointments that may need pre/post hearings', () => {
    const step1Scenarios: Scenario<AppointmentPage, PrePostAppointmentPage>[] = [
      {
        scenarioName: 'an appointment of type VLB',
        appointmentType: 'VLB',
        setupScenario: page => {
          page.typeOfAppointmentField.select('Video Link - Court Hearing')
          page.locationField.select('Local name two')
          page.dateField.clear()
          page.dateField.type(tomorrowDisplay)
          page.selectStartTime('12', '30')
          page.selectEndTime('13', '10')
          page.notesForStaffTextArea.type('Staff note')
          page.notesForPrisonersTextArea.type('Prisoner note')
        },
        expectations: page => {
          page.summaryList.rows.then(rows => {
            expect(rows).to.have.lengthOf(6)
            expect(rows[0]).to.contain({ key: 'Location', value: 'Local name two' })
            expect(rows[1]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
            expect(rows[2]).to.contain({ key: 'Court hearing start time', value: '12:30' })
            expect(rows[3]).to.contain({ key: 'Court hearing end time', value: '13:10' })
            expect(rows[4]).to.contain({ key: 'Notes for prison staff', value: 'Staff note' })
            expect(rows[5]).to.contain({ key: 'Notes for prisoner', value: 'Prisoner note' })
          })
        },
      },
      {
        scenarioName: 'an appointment of type VLB without comments',
        appointmentType: 'VLB',
        setupScenario: page => {
          page.typeOfAppointmentField.select('Video Link - Court Hearing')
          page.locationField.select('Local name two')
          page.dateField.clear()
          page.dateField.type(tomorrowDisplay)
          page.selectStartTime('11', '05')
          page.selectEndTime('11', '45')
        },
        expectations: page => {
          page.summaryList.rows.then(rows => {
            expect(rows).to.have.lengthOf(6)
            expect(rows[0]).to.contain({ key: 'Location', value: 'Local name two' })
            expect(rows[1]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
            expect(rows[2]).to.contain({ key: 'Court hearing start time', value: '11:05' })
            expect(rows[3]).to.contain({ key: 'Court hearing end time', value: '11:45' })
            expect(rows[4]).to.contain({ key: 'Notes for prison staff', value: 'None entered' })
            expect(rows[5]).to.contain({ key: 'Notes for prisoner', value: 'None entered' })
          })
        },
      },
    ]
    for (const { scenarioName, setupScenario, expectations } of step1Scenarios) {
      it(`should allow entering main details for ${scenarioName}`, () => {
        stubSchedules({ date: tomorrow })
        stubLocation(today)
        stubLocation(tomorrow)

        const addPage = visitAppointmentPage()
        setupScenario(addPage)

        cy.task('stubBookAVideoLinkCourts')
        cy.task('stubBookAVideoLinkReferenceCodes', { group: 'COURT_HEARING_TYPE', response: meetingTypes })
        cy.task('stubGetMappingUsingNomisLocationId', { nomisLocationId: 25762, dpsLocationId: 'location-2' })

        addPage.submit()

        const prePostPage = Page.verifyOnPage(PrePostAppointmentPage)
        expectations(prePostPage)

        prePostPage.addPreAppointmentRadio.options.should('deep.equal', [
          { label: 'Yes', value: 'yes', selected: false },
          { label: 'No', value: 'no', selected: false },
        ])
        prePostPage.preLocationSelect.element.should('be.hidden')
        prePostPage.preScheduledEventsTable.container.should('be.hidden')
        prePostPage.addPostAppointmentRadio.options.should('deep.equal', [
          { label: 'Yes', value: 'yes', selected: false },
          { label: 'No', value: 'no', selected: false },
        ])
        prePostPage.postLocationSelect.element.should('be.hidden')
        prePostPage.postScheduledEventsTable.container.should('be.hidden')
        prePostPage.courtSelect.options.should('deep.equal', [
          { label: 'Select court', value: '', selected: true },
          { label: 'Leeds Court', value: 'ABC', selected: false },
          { label: 'Barnsley Court', value: 'DEF', selected: false },
          { label: 'Sheffield Court', value: 'SHF', selected: false },
        ])
        prePostPage.hearingTypeSelect.options.should('deep.equal', [
          { label: 'Select hearing type', value: '', selected: true },
          { label: 'Post-sentence report', value: 'PSR', selected: false },
          { label: 'Parole Report', value: 'PR', selected: false },
          { label: 'HDC (home detention curfew)', value: 'HDC', selected: false },
        ])
        prePostPage.knowVideoLinkRadio.options.should('deep.equal', [
          { label: 'Yes', value: 'yes', selected: false },
          { label: 'No', value: 'no', selected: false },
        ])
        prePostPage.cvpNumberInput.should('be.hidden')
        prePostPage.videoLinkUrlInput.should('be.hidden')
        prePostPage.guestPinRequiredRadio.options.should('deep.equal', [
          { label: 'Yes', value: 'yes', selected: false },
          { label: 'No', value: 'no', selected: false },
        ])
        prePostPage.guestPinInput.should('be.hidden')
      })
    }

    const step2Scenarios: (Scenario<PrePostAppointmentPage, PrePostConfirmationPage> & MovementSlipScenario)[] = [
      {
        scenarioName: 'no pre or post briefings',
        appointmentType: 'VLB',
        setupScenario: page => {
          page.addPreAppointmentRadio.selectOption('No')
          page.addPostAppointmentRadio.selectOption('No')
          page.courtSelect.select('Leeds Court')
          page.hearingTypeSelect.select('Parole Report')
          page.knowVideoLinkRadio.selectOption('No')
          page.guestPinRequiredRadio.selectOption('No')

          cy.task('stubBookAVideoLinkCreateBooking', {
            createRequest: {
              bookingType: 'COURT',
              prisoners: [
                {
                  prisonCode: 'MDI',
                  prisonerNumber: 'G6123VU',
                  appointments: [
                    {
                      type: 'VLB_COURT_MAIN',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '12:30',
                      endTime: '13:10',
                    },
                  ],
                },
              ],
              courtCode: 'ABC',
              probationTeamCode: '',
              courtHearingType: 'PR',
              notesForStaff: 'Staff note',
              notesForPrisoners: 'Prisoner note',
            },
          })
        },
        expectations: page => {
          page.summaryListPre.element.should('not.exist')
          page.summaryListPost.element.should('not.exist')
          page.summaryListCourt.rows.then(rows => {
            expect(rows).to.have.lengthOf(4)
            expect(rows[0]).to.contain({ key: 'Court location', value: 'Leeds Court' })
            expect(rows[1]).to.contain({ key: 'Hearing type', value: 'Parole Report' })
            expect(rows[2]).to.contain({ key: 'Court hearing link', value: 'None entered' })
            expect(rows[3]).to.contain({ key: 'Guest pin', value: 'None entered' })
          })
        },
        movementSlipExpectation: {
          dateAndTime: `${formatDate(tomorrow, 'long')} 12:30 to 13:10`,
          reason: 'Video Link - Court Hearing',
          comments: 'Prisoner note',
        },
      },
      {
        scenarioName: 'pre briefings',
        appointmentType: 'VLB',
        setupScenario: page => {
          page.addPreAppointmentRadio.selectOption('Yes')
          page.preLocationSelect.select('Local name two')
          page.preScheduledEventsTable.eventsList.should('deep.equal', [
            { time: '10:00 to 11:00', description: 'Place 1 - Some activity - some notes' },
          ])
          page.addPostAppointmentRadio.selectOption('No')
          page.courtSelect.select('Leeds Court')
          page.hearingTypeSelect.select('Parole Report')
          page.knowVideoLinkRadio.selectOption('No')
          page.guestPinRequiredRadio.selectOption('No')

          cy.task('stubBookAVideoLinkCreateBooking', {
            createRequest: {
              bookingType: 'COURT',
              prisoners: [
                {
                  prisonCode: 'MDI',
                  prisonerNumber: 'G6123VU',
                  appointments: [
                    {
                      type: 'VLB_COURT_PRE',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '12:15',
                      endTime: '12:30',
                    },
                    {
                      type: 'VLB_COURT_MAIN',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '12:30',
                      endTime: '13:10',
                    },
                  ],
                },
              ],
              courtCode: 'ABC',
              probationTeamCode: '',
              courtHearingType: 'PR',
              notesForStaff: 'Staff note',
              notesForPrisoners: 'Prisoner note',
            },
          })
        },
        expectations: page => {
          page.summaryListPre.rows.then(rows => {
            expect(rows).to.have.lengthOf(1)
            expect(rows[0]).to.contain({ key: 'Pre-court hearing briefing', value: 'Local name two - 12:15 to 12:30' })
          })
          page.summaryListPost.element.should('not.exist')
          page.summaryListCourt.rows.then(rows => {
            expect(rows).to.have.lengthOf(4)
            expect(rows[0]).to.contain({ key: 'Court location', value: 'Leeds Court' })
            expect(rows[1]).to.contain({ key: 'Hearing type', value: 'Parole Report' })
            expect(rows[2]).to.contain({ key: 'Court hearing link', value: 'None entered' })
            expect(rows[3]).to.contain({ key: 'Guest pin', value: 'None entered' })
          })
        },
        movementSlipExpectation: {
          dateAndTime: `${formatDate(tomorrow, 'long')} 12:30 to 13:10`,
          reason: 'Video Link - Court Hearing',
          comments: 'Prisoner note',
        },
      },
      {
        scenarioName: 'post briefings',
        appointmentType: 'VLB',
        setupScenario: page => {
          page.addPreAppointmentRadio.selectOption('No')
          page.addPostAppointmentRadio.selectOption('Yes')
          page.postLocationSelect.select('Local name two')
          page.postScheduledEventsTable.eventsList.should('deep.equal', [
            { time: '10:00 to 11:00', description: 'Place 1 - Some activity - some notes' },
          ])
          page.courtSelect.select('Leeds Court')
          page.hearingTypeSelect.select('Parole Report')
          page.knowVideoLinkRadio.selectOption('No')
          page.guestPinRequiredRadio.selectOption('No')

          cy.task('stubBookAVideoLinkCreateBooking', {
            createRequest: {
              bookingType: 'COURT',
              prisoners: [
                {
                  prisonCode: 'MDI',
                  prisonerNumber: 'G6123VU',
                  appointments: [
                    {
                      type: 'VLB_COURT_MAIN',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '12:30',
                      endTime: '13:10',
                    },
                    {
                      type: 'VLB_COURT_POST',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '13:10',
                      endTime: '13:25',
                    },
                  ],
                },
              ],
              courtCode: 'ABC',
              probationTeamCode: '',
              courtHearingType: 'PR',
              notesForStaff: 'Staff note',
              notesForPrisoners: 'Prisoner note',
            },
          })
        },
        expectations: page => {
          page.summaryListPre.element.should('not.exist')
          page.summaryListPost.rows.then(rows => {
            expect(rows).to.have.lengthOf(1)
            expect(rows[0]).to.contain({ key: 'Post-court hearing briefing', value: 'Local name two - 13:10 to 13:25' })
          })
          page.summaryListCourt.rows.then(rows => {
            expect(rows).to.have.lengthOf(4)
            expect(rows[0]).to.contain({ key: 'Court location', value: 'Leeds Court' })
            expect(rows[1]).to.contain({ key: 'Hearing type', value: 'Parole Report' })
            expect(rows[2]).to.contain({ key: 'Court hearing link', value: 'None entered' })
            expect(rows[3]).to.contain({ key: 'Guest pin', value: 'None entered' })
          })
        },
        movementSlipExpectation: {
          dateAndTime: `${formatDate(tomorrow, 'long')} 12:30 to 13:10`,
          reason: 'Video Link - Court Hearing',
          comments: 'Prisoner note',
        },
      },
      {
        scenarioName: 'pre & post briefings',
        appointmentType: 'VLB',
        setupScenario: page => {
          page.addPreAppointmentRadio.selectOption('Yes')
          page.preLocationSelect.select('Local name two')
          page.preScheduledEventsTable.eventsList.should('deep.equal', [
            { time: '10:00 to 11:00', description: 'Place 1 - Some activity - some notes' },
          ])
          page.addPostAppointmentRadio.selectOption('Yes')
          page.postLocationSelect.select('Local name two')
          page.postScheduledEventsTable.eventsList.should('deep.equal', [
            { time: '10:00 to 11:00', description: 'Place 1 - Some activity - some notes' },
          ])
          page.courtSelect.select('Leeds Court')
          page.hearingTypeSelect.select('Parole Report')
          page.knowVideoLinkRadio.selectOption('No')
          page.guestPinRequiredRadio.selectOption('No')

          cy.task('stubBookAVideoLinkCreateBooking', {
            createRequest: {
              bookingType: 'COURT',
              prisoners: [
                {
                  prisonCode: 'MDI',
                  prisonerNumber: 'G6123VU',
                  appointments: [
                    {
                      type: 'VLB_COURT_PRE',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '12:15',
                      endTime: '12:30',
                    },
                    {
                      type: 'VLB_COURT_MAIN',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '12:30',
                      endTime: '13:10',
                    },
                    {
                      type: 'VLB_COURT_POST',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '13:10',
                      endTime: '13:25',
                    },
                  ],
                },
              ],
              courtCode: 'ABC',
              probationTeamCode: '',
              courtHearingType: 'PR',
              notesForStaff: 'Staff note',
              notesForPrisoners: 'Prisoner note',
            },
          })
        },
        expectations: page => {
          page.summaryListPre.rows.then(rows => {
            expect(rows).to.have.lengthOf(1)
            expect(rows[0]).to.contain({ key: 'Pre-court hearing briefing', value: 'Local name two - 12:15 to 12:30' })
          })
          page.summaryListPost.rows.then(rows => {
            expect(rows).to.have.lengthOf(1)
            expect(rows[0]).to.contain({ key: 'Post-court hearing briefing', value: 'Local name two - 13:10 to 13:25' })
          })
          page.summaryListCourt.rows.then(rows => {
            expect(rows).to.have.lengthOf(4)
            expect(rows[0]).to.contain({ key: 'Court location', value: 'Leeds Court' })
            expect(rows[1]).to.contain({ key: 'Hearing type', value: 'Parole Report' })
            expect(rows[2]).to.contain({ key: 'Court hearing link', value: 'None entered' })
            expect(rows[3]).to.contain({ key: 'Guest pin', value: 'None entered' })
          })
        },
        movementSlipExpectation: {
          dateAndTime: `${formatDate(tomorrow, 'long')} 12:30 to 13:10`,
          reason: 'Video Link - Court Hearing',
          comments: 'Prisoner note',
        },
      },
      {
        scenarioName: 'number for CVP address',
        appointmentType: 'VLB',
        setupScenario: page => {
          page.addPreAppointmentRadio.selectOption('No')
          page.addPostAppointmentRadio.selectOption('No')
          page.courtSelect.select('Leeds Court')
          page.hearingTypeSelect.select('Parole Report')
          page.knowVideoLinkRadio.selectOption('Yes')
          page.cvpNumberInput.type('8589')
          page.guestPinRequiredRadio.selectOption('No')

          cy.task('stubBookAVideoLinkCreateBooking', {
            createRequest: {
              bookingType: 'COURT',
              prisoners: [
                {
                  prisonCode: 'MDI',
                  prisonerNumber: 'G6123VU',
                  appointments: [
                    {
                      type: 'VLB_COURT_MAIN',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '12:30',
                      endTime: '13:10',
                    },
                  ],
                },
              ],
              courtCode: 'ABC',
              probationTeamCode: '',
              courtHearingType: 'PR',
              hmctsNumber: '8589',
              notesForStaff: 'Staff note',
              notesForPrisoners: 'Prisoner note',
            },
          })
        },
        expectations: page => {
          page.summaryListPre.element.should('not.exist')
          page.summaryListPost.element.should('not.exist')
          page.summaryListCourt.rows.then(rows => {
            expect(rows).to.have.lengthOf(4)
            expect(rows[0]).to.contain({ key: 'Court location', value: 'Leeds Court' })
            expect(rows[1]).to.contain({ key: 'Hearing type', value: 'Parole Report' })
            expect(rows[2]).to.contain({ key: 'Court hearing link', value: 'HMCTS8589@meet.video.justice.gov.uk' })
            expect(rows[3]).to.contain({ key: 'Guest pin', value: 'None entered' })
          })
        },
        movementSlipExpectation: {
          dateAndTime: `${formatDate(tomorrow, 'long')} 12:30 to 13:10`,
          reason: 'Video Link - Court Hearing',
          comments: 'Prisoner note',
        },
      },
      {
        scenarioName: 'video link URL',
        appointmentType: 'VLB',
        setupScenario: page => {
          page.addPreAppointmentRadio.selectOption('No')
          page.addPostAppointmentRadio.selectOption('No')
          page.courtSelect.select('Leeds Court')
          page.hearingTypeSelect.select('Parole Report')
          page.knowVideoLinkRadio.selectOption('Yes')
          page.videoLinkUrlInput.type('https://example.com/8589')
          page.guestPinRequiredRadio.selectOption('No')

          cy.task('stubBookAVideoLinkCreateBooking', {
            createRequest: {
              bookingType: 'COURT',
              prisoners: [
                {
                  prisonCode: 'MDI',
                  prisonerNumber: 'G6123VU',
                  appointments: [
                    {
                      type: 'VLB_COURT_MAIN',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '12:30',
                      endTime: '13:10',
                    },
                  ],
                },
              ],
              courtCode: 'ABC',
              probationTeamCode: '',
              courtHearingType: 'PR',
              videoLinkUrl: 'https://example.com/8589',
              notesForStaff: 'Staff note',
              notesForPrisoners: 'Prisoner note',
            },
          })
        },
        expectations: page => {
          page.summaryListPre.element.should('not.exist')
          page.summaryListPost.element.should('not.exist')
          page.summaryListCourt.rows.then(rows => {
            expect(rows).to.have.lengthOf(4)
            expect(rows[0]).to.contain({ key: 'Court location', value: 'Leeds Court' })
            expect(rows[1]).to.contain({ key: 'Hearing type', value: 'Parole Report' })
            expect(rows[2]).to.contain({ key: 'Court hearing link', value: 'https://example.com/8589' })
            expect(rows[3]).to.contain({ key: 'Guest pin', value: 'None entered' })
          })
        },
        movementSlipExpectation: {
          dateAndTime: `${formatDate(tomorrow, 'long')} 12:30 to 13:10`,
          reason: 'Video Link - Court Hearing',
          comments: 'Prisoner note',
        },
      },
      {
        scenarioName: 'guest pin',
        appointmentType: 'VLB',
        setupScenario: page => {
          page.addPreAppointmentRadio.selectOption('No')
          page.addPostAppointmentRadio.selectOption('No')
          page.courtSelect.select('Leeds Court')
          page.hearingTypeSelect.select('Parole Report')
          page.knowVideoLinkRadio.selectOption('No')
          page.guestPinRequiredRadio.selectOption('Yes')
          page.guestPinInput.type('556677')

          cy.task('stubBookAVideoLinkCreateBooking', {
            createRequest: {
              bookingType: 'COURT',
              prisoners: [
                {
                  prisonCode: 'MDI',
                  prisonerNumber: 'G6123VU',
                  appointments: [
                    {
                      type: 'VLB_COURT_MAIN',
                      locationKey: 'ABC',
                      date: tomorrow,
                      startTime: '12:30',
                      endTime: '13:10',
                    },
                  ],
                },
              ],
              courtCode: 'ABC',
              probationTeamCode: '',
              courtHearingType: 'PR',
              guestPin: '556677',
              notesForStaff: 'Staff note',
              notesForPrisoners: 'Prisoner note',
            },
          })
        },
        expectations: page => {
          page.summaryListPre.element.should('not.exist')
          page.summaryListPost.element.should('not.exist')
          page.summaryListCourt.rows.then(rows => {
            expect(rows).to.have.lengthOf(4)
            expect(rows[0]).to.contain({ key: 'Court location', value: 'Leeds Court' })
            expect(rows[1]).to.contain({ key: 'Hearing type', value: 'Parole Report' })
            expect(rows[2]).to.contain({ key: 'Court hearing link', value: 'None entered' })
            expect(rows[3]).to.contain({ key: 'Guest pin', value: '556677' })
          })
        },
        movementSlipExpectation: {
          dateAndTime: `${formatDate(tomorrow, 'long')} 12:30 to 13:10`,
          reason: 'Video Link - Court Hearing',
          comments: 'Prisoner note',
        },
      },
    ]
    for (const { scenarioName, setupScenario, expectations, movementSlipExpectation } of step2Scenarios) {
      it(`should allow creating a VLB appointment with ${scenarioName} and generate a movement slip`, () => {
        stubSchedules({ date: tomorrow })
        stubLocation(today)
        stubLocation(tomorrow)
        cy.task('stubActivitiesAtLocation', {
          locationId: 25762,
          date: tomorrow,
          response: [
            {
              ...prisonerSchedulesMock[0],
              eventDescription: 'Some activity',
              eventLocation: 'Place 1',
              comment: 'some notes',
            },
          ],
        })

        const addPage = visitAppointmentPage()
        addPage.typeOfAppointmentField.select('Video Link - Court Hearing')
        addPage.locationField.select('Local name two')
        addPage.dateField.clear()
        addPage.dateField.type(tomorrowDisplay)
        addPage.selectStartTime('12', '30')
        addPage.selectEndTime('13', '10')
        addPage.notesForStaffTextArea.type('Staff note')
        addPage.notesForPrisonersTextArea.type('Prisoner note')

        cy.task('stubBookAVideoLinkCourts')
        cy.task('stubBookAVideoLinkReferenceCodes', { group: 'COURT_HEARING_TYPE', response: meetingTypes })
        cy.task('stubGetMappingUsingNomisLocationId', { nomisLocationId: 25762, dpsLocationId: 'location-2' })

        addPage.submit()

        const prePostPage = Page.verifyOnPage(PrePostAppointmentPage)
        setupScenario(prePostPage)

        cy.task('stubGetAgency', { agencyId: 'MDI' })
        prePostPage.submit()

        const prePostConfirmationPage = Page.verifyOnPage(PrePostConfirmationPage)
        prePostConfirmationPage.summaryListCommon.rows.then(rows => {
          expect(rows).to.have.lengthOf(6)
          expect(rows[0]).to.contain({ key: 'Name', value: 'John Saunders' })
          expect(rows[1]).to.contain({ key: 'Prison', value: 'Moorland (HMP & YOI)' })
          expect(rows[2]).to.contain({ key: 'Prison room', value: 'Local name two' })
          expect(rows[3]).to.contain({ key: 'Date', value: formatDate(tomorrow, 'long') })
          expect(rows[4]).to.contain({ key: 'Start time', value: '12:30' })
          expect(rows[5]).to.contain({ key: 'End time', value: '13:10' })
        })
        prePostConfirmationPage.summaryListNotes.rows.then(rows => {
          expect(rows).to.have.lengthOf(2)
          expect(rows[0]).to.contain({ key: 'Notes for prison staff', value: 'Staff note' })
          expect(rows[1]).to.contain({ key: 'Notes for prisoner', value: 'Prisoner note' })
        })
        expectations(prePostConfirmationPage)

        let movementSlipUrl: string
        prePostConfirmationPage.movementSlipLink.then($anchor => {
          movementSlipUrl = $anchor.attr('href')
          cy.visit(movementSlipUrl)
        })
        expectCorrectMovementSlip(movementSlipExpectation).then(() => {
          // cannot load movement slip more than once
          cy.request({ url: movementSlipUrl, failOnStatusCode: false }).its('status').should('equal', 404)
        })
      })
    }
  })

  it('should pre-fill details of an existing appointment', () => {
    cy.task('stubGetAppointment', {
      appointment: {
        appointment: {
          id: 81,
          agencyId: 'MDI',
          locationId: 25762,
          appointmentTypeCode: 'VLPM',
          offenderNo: prisonerNumber,
          startTime: `${tomorrow}T12:00:00`,
          endTime: `${tomorrow}T13:30:00`,
          comment: 'Comment',
        },
      },
    })
    cy.task('stubGetMappingUsingNomisLocationId', { nomisLocationId: 25762, dpsLocationId: 'location-2' })
    stubSchedules({ date: tomorrow })
    stubLocation(tomorrow)
    cy.task('stubBookAVideoLinkBooking', {
      searchRequest: {
        prisonerNumber: 'G6123VU',
        locationKey: 'ABC',
        date: tomorrow,
        startTime: '12:00',
        endTime: '13:30',
      },
      response: {
        ...probationBookingMock,
        probationTeamCode: 'ABC',
        prisonAppointments: [
          {
            ...probationBookingMock.prisonAppointments[0],
            appointmentDate: tomorrow,
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
      expect(rows).to.have.lengthOf(2)
      expect(rows[0]).to.contain({ key: 'Type of appointment', value: 'Video Link - Probation Meeting' })
      expect(rows[1]).to.contain({ key: 'Probation team', value: 'Blackpool' })
    })
    page.locationField.value.should('equal', 'location-2')
    page.officerFullNameInput.should('have.value', 'Test name')
    page.officerEmailInput.should('have.value', 'Test email')
    page.officerTelephoneInput.should('have.value', 'Test number')
    page.meetingTypeRadioButtons.value.should('equal', 'PSR')
    page.dateField.should('have.value', tomorrowDisplay)
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
  date,
  appointments,
  activities,
  courtEvents,
  externalTransfers,
  visits,
}: {
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
  cy.task('stubActivitiesAtLocation', { locationId: 25762, date, response: [] })
  cy.task('stubActivityList', { agencyId: 'MDI', locationId: 25762, date, usage: 'VISIT', response: [] })
  cy.task('stubActivityList', { agencyId: 'MDI', locationId: 25762, date, usage: 'APP', response: [] })
}

interface Scenario<P1 extends Page, P2 extends Page> {
  scenarioName: string
  appointmentType: string
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

function expectCorrectMovementSlip(expected: MovementSlipScenario['movementSlipExpectation']): Cypress.Chainable {
  const movementSlip = Page.verifyOnPage(MovementSlip)
  movementSlip.shouldNotShowPageChrome()
  movementSlip.labels.should('deep.equal', [
    { title: 'Name', description: 'John Saunders' },
    { title: 'Prison number', description: 'G6123VU' },
    { title: 'Cell location', description: '1-1-035' },
    { title: 'Date and time', description: expected.dateAndTime },
    { title: 'Moving to', description: 'Local name two' },
    { title: 'Reason', description: expected.reason },
    { title: 'Comments', description: expected.comments ?? '--' },
    { title: 'Created by', description: 'John Smith' },
  ])
  return cy.end()
}
