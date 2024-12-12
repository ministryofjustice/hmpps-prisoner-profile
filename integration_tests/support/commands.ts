import 'cypress-file-upload'
import HistoryForLocationItem from '../../server/data/interfaces/prisonApi/HistoryForLocationItem'
import InmateDetail from '../../server/data/interfaces/prisonApi/InmateDetail'
import { ComplexityLevel } from '../../server/data/interfaces/complexityApi/ComplexityOfNeed'
import { ReferenceCodeDomain } from '../../server/data/interfaces/prisonApi/ReferenceCode'

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true, redirectPath: '/' }) => {
  const { failOnStatusCode, redirectPath } = options
  cy.request(redirectPath)
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, { failOnStatusCode }))
})

Cypress.Commands.add('setupBannerStubs', ({ prisonerNumber, prisonerDataOverrides, bookingId = 1102484 }) => {
  cy.task('stubPrisonerData', { prisonerNumber, overrides: prisonerDataOverrides })
  cy.task('stubEventsForProfileImage', prisonerNumber)
  cy.task('stubAssessments', bookingId)
  cy.task('stubInmateDetail', { bookingId })
  cy.task('stubGetAlerts')
  cy.task('stubAlertDetails')
  cy.task('stubGetCurrentCsip', prisonerNumber)
  cy.task('stubGetLatestArrivalDate', prisonerNumber)
})

Cypress.Commands.add(
  'setupOverviewPageStubs',
  ({
    bookingId,
    prisonerNumber,
    caseLoads = [
      {
        caseLoadId: 'MDI',
        currentlyActive: true,
        description: '',
        type: '',
        caseloadFunction: '',
      },
    ],
    restrictedPatient = false,
    prisonerDataOverrides = {},
    staffRoles = [],
    complexityLevel = ComplexityLevel.Low,
  }) => {
    cy.task('stubNonAssociations', prisonerNumber)
    cy.task('stubPrisonerData', { prisonerNumber, restrictedPatient, overrides: prisonerDataOverrides })
    cy.task('stubAccountBalances', bookingId)
    cy.task('stubAdjudications', bookingId)
    cy.task('stubGetCaseNoteCount', bookingId)
    cy.task('stubGetReviews', bookingId)
    cy.task('stubVisitSummary', bookingId)
    cy.task('stubVisitBalances', prisonerNumber)
    cy.task('stubAssessments', bookingId)
    cy.task('stubEventsForToday', bookingId)
    cy.task('stubPomData')
    cy.task('stubKeyWorkerData', { prisonerNumber })
    cy.task('stubKeyWorkerSessions', { type: 'KA', subType: 'KS', numMonths: 38, bookingId })
    cy.task('stubGetOffenderContacts')
    cy.task('stubEventsForProfileImage', prisonerNumber)
    cy.task('stubGetMainOffence', bookingId)
    cy.task('stubGetFullStatus', prisonerNumber)
    cy.task('stubGetNextCourtEvent', { bookingId })
    cy.task('stubGetCourtCasesCount', { bookingId })
    cy.task('stubGetPathfinderNominal')
    cy.task('stubGetPathfinderNominal404')
    cy.task('stubGetSocNominal')
    cy.task('stubGetSocNominal404')
    cy.task('stubGetStaffRoles', staffRoles)
    cy.task('stubGetLearnerNeurodivergence', { prisonerNumber })
    cy.task('stubInmateDetail', { bookingId, inmateDetail: { activeAlertCount: 80, inactiveAlertCount: 80 } })
    cy.task('stubMovements', prisonerNumber)
    cy.task('stubGetCommunityManager')
    cy.task('stubScheduledTransfers', prisonerNumber)
    cy.task('stubPrisonerDetail', prisonerNumber)
    cy.task('stubComplexityData', { prisonerNumber, complexityLevel })
    cy.task('stubGetLatestCalculation', { prisonerNumber })
    cy.task('stubGetAlerts')
    cy.setupComponentsData({ caseLoads })
    cy.task('stubGetCurrentCsip', prisonerNumber)
    cy.task('stubGetLatestArrivalDate', '2024-01-01')
  },
)

Cypress.Commands.add('setupAlertsPageStubs', ({ bookingId, prisonerNumber, prisonerDataOverrides = {} }) => {
  cy.task('stubEventsForProfileImage', prisonerNumber)
  cy.task('stubPrisonerData', { prisonerNumber, overrides: prisonerDataOverrides })

  if (bookingId === 1234567) {
    cy.task('stubInmateDetail', { bookingId, inmateDetail: { activeAlertCount: 0, inactiveAlertCount: 0 } })
  } else {
    cy.task('stubInmateDetail', { bookingId, inmateDetail: { activeAlertCount: 80, inactiveAlertCount: 80 } })
  }
  cy.task('stubGetAlerts')
})

Cypress.Commands.add('setupWorkAndSkillsPageStubs', ({ prisonerNumber, emptyStates = false }) => {
  cy.task('stubGetLearnerEmployabilitySkills', { prisonerNumber })
  cy.task('stubGetLearnerEducation', prisonerNumber)
  cy.task('stubGetLearnerProfile', prisonerNumber)
  cy.task('stubGetLearnerLatestAssessments', { prisonerNumber })
  cy.task('stubGetCuriousGoals', prisonerNumber)
  cy.task('stubGetLearnerNeurodivergence', { prisonerNumber })
  cy.task('stubGetOffenderAttendanceHistory', prisonerNumber)
  cy.task('stubGetOffenderActivities', { prisonerNumber, emptyStates })
  cy.task('stubAttendanceHistory', prisonerNumber)
  cy.task('stubGetPlpActiveGoals', prisonerNumber)
  cy.task('stubGetAllPrisons')
  cy.task('stubGetAlerts')
})

Cypress.Commands.add('getDataQa', id => {
  return cy.get(`[data-qa=${id}]`)
})

Cypress.Commands.add('findDataQa', { prevSubject: true }, (subject, id) => {
  return subject.find(`[data-qa=${id}]`)
})

Cypress.Commands.add('setupOffencesPageSentencedStubs', ({ prisonerNumber, bookingId }) => {
  cy.task('stubGetCourtCasesSentenced', bookingId)
  cy.task('stubGetOffenceHistory', prisonerNumber)
  cy.task('stubGetSentenceTermsSentenced', bookingId)
  cy.task('stubGetPrisonerSentenceDetails', prisonerNumber)
  cy.task('stubGetCourtDateResultsSentenced', prisonerNumber)
  cy.task('stubGetSentenceSummaryWithSentence', prisonerNumber)
})

Cypress.Commands.add('setupOffencesPageUnsentencedStubs', ({ prisonerNumber, bookingId }) => {
  cy.task('stubGetCourtCasesUnsentenced', bookingId)
  cy.task('stubGetOffenceHistory', prisonerNumber)
  cy.task('stubGetSentenceTermsUnsentenced', bookingId)
  cy.task('stubGetPrisonerSentenceDetails', prisonerNumber)
  cy.task('stubGetCourtDateResultsUnsentenced', prisonerNumber)
  cy.task('stubGetSentenceSummaryWithoutSentence', prisonerNumber)
})

Cypress.Commands.add('setupUserAuth', (options = {}) => {
  cy.task('stubSignIn', options)
})

Cypress.Commands.add('setupComponentsData', (options = {}) => {
  cy.task('stubComponentsData', options)
  cy.task('stubUserCaseLoads', options.caseLoads)
})

Cypress.Commands.add('setupPersonalPageSubs', ({ bookingId, prisonerNumber, prisonerDataOverrides }) => {
  cy.setupBannerStubs({ prisonerNumber, prisonerDataOverrides })
  cy.task('stubInmateDetail', { bookingId })
  cy.task('stubPrisonerDetail', prisonerNumber)
  cy.task('stubSecondaryLanguages', bookingId)
  cy.task('stubProperty', bookingId)
  cy.task('stubAddresses', { prisonerNumber })
  cy.task('stubOffenderContacts', prisonerNumber)
  cy.task('stubPersonAddresses')
  cy.task('stubImages')
  cy.task('stubHealthReferenceDomain')
  cy.task('stubHealthTreatmentReferenceDomain')
  cy.task('stubReasonableAdjustments', bookingId)
  cy.task('stubGetIdentifiers', prisonerNumber)
  cy.task('stubGetLearnerNeurodivergence', { prisonerNumber })
  cy.task('stubBeliefHistory')
  cy.task('stubGetDistinguishingMarksForPrisoner', { prisonerNumber })
  cy.task('stubPrisonPersonGetImage', { prisonerNumber })
})

Cypress.Commands.add('setupMoneyStubs', ({ bookingId, prisonerNumber, prisonId = {} }) => {
  cy.task('stubPrisonerData', { prisonerNumber })
  cy.task('stubInmateDetail', { bookingId })
  cy.task('stubAssessments', bookingId)
  cy.task('stubAccountBalances', bookingId)
  cy.task('stubGetAgency', { agencyId: prisonId })
  cy.task('stubSpendsTransactions', prisonerNumber)
  cy.task('stubPrivateCashTransactions', prisonerNumber)
  cy.task('stubSpendsHOATransactions', prisonerNumber)
  cy.task('stubSpendsWHFTransactions', prisonerNumber)
  cy.task('stubSavingsTransactions', prisonerNumber)
  cy.task('stubDamageObligations', prisonerNumber)
})

Cypress.Commands.add('setupPrisonerSchedulePageStubs', ({ bookingId }) => {
  cy.task('stubgetScheduledEventsForNextWeek', bookingId)
  cy.task('stubgetScheduledEventsForThisWeek', bookingId)
})

Cypress.Commands.add(
  'setupSpecificLocationHistoryPageStubs',
  ({ prisonerNumber, bookingId, locationId, staffId, prisonId, caseLoads, sharingHistory }) => {
    cy.task('stubPrisonerData', { prisonerNumber })
    cy.task('stubGetDetails', prisonerNumber)
    cy.task('stubGetAttributesForLocation', locationId)
    cy.task('stubGetHistoryForLocation', {
      locationId,
      locationHistories: [
        { bookingId },
        ...sharingHistory.map(i => {
          return {
            bookingId: i.bookingId,
            assignmentDateTime: i.movedIn,
            assignmentEndDateTime: i.movedOut,
          } as HistoryForLocationItem
        }),
      ],
    })
    cy.task('stubGetCellMoveReasonTypes')
    cy.task('stubInmateDetail', { bookingId })
    cy.task('stubStaffDetails', staffId)
    cy.task('stubGetCellMoveReason', bookingId)
    cy.task('stubGetCaseNote', { prisonerNumber, caseNoteId: 2 })
    cy.task('stubGetCaseNote', { prisonerNumber, caseNoteId: 0 })
    cy.task('stubGetAgency', { agencyId: prisonId })
    cy.task('stubUserCaseLoads', caseLoads)
    cy.task('stubAssessments', bookingId)
    sharingHistory.forEach(i => {
      cy.task('stubInmateDetail', {
        bookingId: i.bookingId,
        inmateDetail: {
          offenderNo: i.prisonerNumber,
          firstName: i.firstName,
          lastName: i.lastName,
        } as Partial<InmateDetail>,
      })
    })
  },
)

Cypress.Commands.add('setupVisitsDetailsPageStubs', ({ prisonerNumber, bookingId, visitsOverrides }) => {
  cy.task('stubPrisonerData', { prisonerNumber })
  cy.task('stubReferenceCodeDomain', { referenceDomain: ReferenceCodeDomain.VisitCompletionReasons })
  cy.task('stubReferenceCodeDomain', { referenceDomain: ReferenceCodeDomain.VisitCancellationReasons })
  cy.task('stubVisitsWithVisitors', { bookingId, visitsOverrides })
  cy.task('stubVisitPrisons', { bookingId })
})

Cypress.Commands.add('setupHealthPings', ({ httpStatus }) => {
  cy.task('stubAuthPing')
  cy.task('stubTokenVerificationPing', httpStatus)
  cy.task('stubPrisonApiPing', httpStatus)
  cy.task('stubPrisonerSearchPing', httpStatus)
  cy.task('stubBookAVideoLinkPing', httpStatus)
})

Cypress.Commands.add('setupPersonRefDataStubs', ({ domainsResp, domainResp, codesResp, codeResp }) => {
  cy.task('stubGetReferenceDataDomains', domainsResp)
  cy.task('stubGetReferenceDataDomain', domainResp)
  cy.task('stubGetReferenceDataCodes', codesResp)
  cy.task('stubGetReferenceDataCode', codeResp)
})
