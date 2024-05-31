import { add, format, startOfToday } from 'date-fns'
import Page from '../pages/page'
import PrisonerSchedulePage from '../pages/prisonerSchedulePage'
import {
  PrisonerScheduleNextWeekMock,
  PrisonerScheduleThisWeekMock,
} from '../../server/data/localMockData/prisonerScheduleMock'
import { componentsNoServicesMock } from '../../server/data/localMockData/componentApi/componentsMetaMock'

context('Prisoner schedule for this week ', () => {
  const prisonerSchedulePageUrl = () => {
    cy.signIn({ redirectPath: '/prisoner/G6123VU/schedule' })
  }

  const prisonerNumber = 'G6123VU'

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupPrisonerSchedulePageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    cy.task('stubComponentsMeta', componentsNoServicesMock)
  })

  it('Prisoner schedule page is displayed', () => {
    prisonerSchedulePageUrl()
    cy.request('/prisoner/G6123VU/schedule').its('body').should('contain', 'John Saunders’ schedule')
    const prisonerSchedulePage = Page.verifyOnPageWithTitle(PrisonerSchedulePage, 'Schedule')

    const dateRangeText = `${PrisonerScheduleThisWeekMock.days[0].date} to ${PrisonerScheduleThisWeekMock.days[6].date}`
    prisonerSchedulePage.scheduleDates().contains(dateRangeText)
    prisonerSchedulePage
      .scheduleSelectWeek()
      .contains(`View 7 days from ${format(add(startOfToday(), { days: 7 }), 'd MMMM yyyy')}`)
    prisonerSchedulePage.firstActivity().contains(PrisonerScheduleThisWeekMock.days[0].date)
    prisonerSchedulePage.morning().contains('Morning')
    prisonerSchedulePage.afternoon().contains('Afternoon')
    prisonerSchedulePage.evening().contains('Evening')
    prisonerSchedulePage.nothingScheduled().contains('Nothing scheduled')
  })
})

context('Prisoner schedule for next week', () => {
  const prisonerSchedulePageUrl = () => {
    cy.signIn({ redirectPath: '/prisoner/G6123VU/schedule?when=nextWeek' })
  }

  const prisonerNumber = 'G6123VU'

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupPrisonerSchedulePageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    cy.task('stubComponentsMeta', componentsNoServicesMock)
  })

  it('Prisoner schedule page is displayed', () => {
    prisonerSchedulePageUrl()
    cy.request('/prisoner/G6123VU/schedule?when=nextWeek').its('body').should('contain', 'John Saunders’ schedule')
    const prisonerSchedulePage = Page.verifyOnPageWithTitle(PrisonerSchedulePage, 'Schedule')
    const dateRangeText = `${PrisonerScheduleNextWeekMock.days[0].date} to ${PrisonerScheduleNextWeekMock.days[6].date}`

    prisonerSchedulePage.scheduleDates().contains(dateRangeText)
    prisonerSchedulePage.scheduleSelectWeek().contains(`View 7 days from today`)
    prisonerSchedulePage.firstActivity().contains(PrisonerScheduleNextWeekMock.days[0].date)
    prisonerSchedulePage.morning().contains('Morning')
    prisonerSchedulePage.afternoon().contains('Afternoon')
    prisonerSchedulePage.evening().contains('Evening')
    prisonerSchedulePage.nothingScheduled().contains('Nothing scheduled')
  })
})
