import 'cypress-file-upload'
import HistoryForLocationItem from '../../server/data/interfaces/prisonApi/HistoryForLocationItem'
import InmateDetail from '../../server/data/interfaces/prisonApi/InmateDetail'
import { ComplexityLevel } from '../../server/data/interfaces/complexityApi/ComplexityOfNeed'
import { ReferenceCodeDomain } from '../../server/data/interfaces/prisonApi/ReferenceCode'
import {
  CountryReferenceDataCodesMock,
  MilitaryRecordsMock,
  phoneUsageReferenceDataMock,
  ReligionReferenceDataCodesMock,
} from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import { corePersonPhysicalAttributesDtoMock } from '../../server/data/localMockData/physicalAttributesMock'
import {
  PersonalRelationshipsContactsDtoMock,
  PersonalRelationshipsDomesticStatusMock,
  PersonalRelationshipsNumberOfChildrenMock,
} from '../../server/data/localMockData/personalRelationshipsApiMock'

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
    isAKeyWorker = true,
    complexityLevel = ComplexityLevel.Low,
  }) => {
    cy.task('stubNonAssociations', prisonerNumber)
    cy.task('stubPrisonerData', { prisonerNumber, restrictedPatient, overrides: prisonerDataOverrides })
    cy.task('stubAccountBalances', bookingId)
    cy.task('stubAdjudications', bookingId)
    cy.task('stubGetCaseNoteCount', bookingId)
    cy.task('stubGetReviews', prisonerNumber)
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
    cy.task('stubHasStaffRole', { roleType: 'KW', response: isAKeyWorker })
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
    cy.task('stubPersonalRelationshipsCount', { prisonerNumber })
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
  cy.task('stubGetLwpAllGoals', prisonerNumber)
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

Cypress.Commands.add('seedRedisEntry', ({ key, value }) => {
  cy.exec(`./integration_tests/scripts/redis-cli "SET ${key} '${JSON.stringify(value).replaceAll('"', '\\"')}'"`)
})

Cypress.Commands.add('refreshReferenceData', domain => {
  cy.exec(`./integration_tests/scripts/redis-cli "SET reference_data_${domain} '${JSON.stringify([])}'"`)
})

Cypress.Commands.add('setupComponentsData', (options = {}) => {
  cy.task('stubComponentsData', options)
  cy.task('stubUserCaseLoads', options.caseLoads)
})

Cypress.Commands.add('setupPersonalPageStubs', ({ bookingId, prisonerNumber, prisonerDataOverrides }) => {
  cy.setupBannerStubs({ prisonerNumber, prisonerDataOverrides })
  cy.task('stubHasStaffRole', { roleType: 'KW', response: false })
  cy.task('stubInmateDetail', { bookingId })
  cy.task('stubPrisonerDetail', prisonerNumber)
  cy.task('stubSecondaryLanguages', bookingId)
  cy.task('stubProperty', bookingId)
  cy.task('stubOffenderContacts', prisonerNumber)
  cy.task('stubAddresses', { prisonerNumber }) // TODO: Remove this after profile edit rolled out
  cy.task('stubGetAddresses', { prisonerNumber })
  cy.task('stubPersonAddresses')
  cy.task('stubImages')
  cy.task('stubHealthReferenceDomain')
  cy.task('stubHealthTreatmentReferenceDomain')
  cy.task('stubReasonableAdjustments', bookingId)
  cy.task('stubGetIdentifiers', prisonerNumber)
  cy.task('stubGetLearnerNeurodivergence', { prisonerNumber })
  cy.task('stubBeliefHistory')
  cy.task('stubGetDistinguishingMarksForPrisoner', { prisonerNumber })
  cy.task('stubGetDistinguishingMarkImage')
  cy.task('stubPersonIntegrationGetReferenceData', {
    domain: 'COUNTRY',
    referenceData: CountryReferenceDataCodesMock,
  })
  cy.task('stubPersonIntegrationGetReferenceData', {
    domain: 'RELF',
    referenceData: ReligionReferenceDataCodesMock,
  })
  cy.task('stubHealthAndMedication', { prisonerNumber })
  cy.task('stubPersonIntegrationGetMilitaryRecords', MilitaryRecordsMock)
  cy.task('stubPersonIntegrationGetPhysicalAttributes', corePersonPhysicalAttributesDtoMock)
  cy.task('stubPersonalCareNeeds')
  cy.task('stubPersonalRelationshipsContacts', { prisonerNumber, resp: PersonalRelationshipsContactsDtoMock })
  cy.task('stubPersonalRelationshipsGetNumberOfChildren', {
    prisonerNumber,
    resp: PersonalRelationshipsNumberOfChildrenMock,
  })
  cy.task('stubPersonalRelationshipsGetDomesticStatus', {
    prisonerNumber,
    resp: PersonalRelationshipsDomesticStatusMock,
  })
  cy.task('stubAllPersonalCareNeeds')
  cy.task('stubPersonIntegrationGetContacts', { prisonerNumber })
  cy.task('stubPersonIntegrationGetReferenceData', {
    domain: 'PHONE_USAGE',
    referenceData: phoneUsageReferenceDataMock,
  })
})

Cypress.Commands.add(
  'setupPermissionsCheckStubs',
  ({ prisonerNumber, keyworker = false, restrictedPatient = false, prisonerDataOverrides = {} }) => {
    cy.task('stubPrisonerData', { prisonerNumber, restrictedPatient, prisonerDataOverrides })
    cy.task('stubCheckStaffRole', { role: 'KW', staffMemberHasRole: keyworker })
  },
)

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
  ({ prisonerNumber, bookingId, nomisLocationId, dpsLocationId, staffId, prisonId, caseLoads, sharingHistory }) => {
    cy.task('stubPrisonerData', { prisonerNumber })
    cy.task('stubGetDetails', prisonerNumber)
    cy.task('stubGetAttributesForLocation', dpsLocationId)
    cy.task('stubGetMappingUsingNomisLocationId', nomisLocationId)
    cy.task('stubGetLocation', dpsLocationId)

    cy.task('stubGetHistoryForLocation', {
      nomisLocationId,
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
  cy.task('stubLocationsInsidePrisonApiPing', httpStatus)
  cy.task('stubNomisSyncPrisonerMappingApiPing', httpStatus)
  cy.task('stubBookAVideoLinkPing', httpStatus)
})

Cypress.Commands.add(
  'setupHealthAndMedicationRefDataStubs',
  ({ foodAllergies, medicalDiets, personalisedDiets, smokerCodes }) => {
    cy.task('stubHealthAndMedicationReferenceDataCodes', { domain: 'FOOD_ALLERGY', resp: foodAllergies || [] })
    cy.task('stubHealthAndMedicationReferenceDataCodes', { domain: 'MEDICAL_DIET', resp: medicalDiets || [] })
    cy.task('stubHealthAndMedicationReferenceDataCodes', { domain: 'PERSONALISED_DIET', resp: personalisedDiets || [] })
    cy.task('stubHealthAndMedicationReferenceDataCodes', { domain: 'SMOKER', resp: smokerCodes || [] })
  },
)
