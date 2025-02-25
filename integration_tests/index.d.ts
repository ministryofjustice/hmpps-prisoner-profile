import type Service from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Service'
import type Component from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Component'
import CaseLoad from '../server/data/interfaces/prisonApi/CaseLoad'
import StaffRole from '../server/data/interfaces/prisonApi/StaffRole'
import Prisoner from '../server/data/interfaces/prisonerSearchApi/Prisoner'
import { ComplexityLevel } from '../server/data/interfaces/complexityApi/ComplexityOfNeed'
import VisitWithVisitors from '../server/data/interfaces/prisonApi/VisitWithVisitors'
import { UserToken } from './mockApis/auth'
import { ReferenceDataCode } from '../server/data/interfaces/prisonPersonApi/prisonPersonApiClient'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
       * @example cy.signIn({ failOnStatusCode: boolean })
       */
      signIn(options?: { failOnStatusCode?: boolean; redirectPath?: string }): Chainable<AUTWindow>

      setupBannerStubs(options: {
        prisonerNumber: string
        prisonerDataOverrides?: Partial<Prisoner>
        bookingId?: number
      }): Chainable<AUTWindow>

      setupOverviewPageStubs(options: {
        prisonerNumber: string
        bookingId: number
        caseLoads?: CaseLoad[]
        restrictedPatient?: boolean
        prisonerDataOverrides?: Partial<Prisoner>
        prisonId?: string
        staffRoles?: StaffRole[]
        complexityLevel?: ComplexityLevel
      }): Chainable<AUTWindow>

      setupAlertsPageStubs(options: {
        prisonerNumber: string
        bookingId: number
        prisonerDataOverrides?: Partial<Prisoner>
      }): Chainable<AUTWindow>

      setupPrisonApiAlertsPageStubs(options: {
        prisonerNumber: string
        bookingId: number
        prisonerDataOverrides?: Partial<Prisoner>
      }): Chainable<AUTWindow>

      setupPersonalPageStubs(options: {
        prisonerNumber: string
        bookingId: number
        prisonerDataOverrides?: Partial<Prisoner>
        caseLoads?: CaseLoad[]
      }): Chainable<AUTWindow>

      setupWorkAndSkillsPageStubs(options: { prisonerNumber: string; emptyStates?: boolean }): Chainable<AUTWindow>

      setupOffencesPageSentencedStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>

      setupOffencesPageUnsentencedStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>

      setupUserAuth(options?: UserToken): Chainable<AUTWindow>

      setupComponentsData(options?: {
        header?: Component
        footer?: Component
        caseLoads?: CaseLoad[]
        services?: Service[]
      }): Chainable<AUTWindow>

      getDataQa(id: string): Chainable<JQuery<HTMLElement>>

      findDataQa(id: string): Chainable<JQuery<HTMLElement>>

      setupPrisonerSchedulePageStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>

      setupMoneyStubs(options: { prisonerNumber: string; bookingId: number; prisonId: string }): Chainable<AUTWindow>

      setupSpecificLocationHistoryPageStubs(options?: {
        prisonerNumber?: string
        bookingId?: number
        nomisLocationId?: number
        dpsLocationId?: string
        staffId?: string
        prisonId: string
        caseLoads: CaseLoad[]
        sharingHistory: {
          bookingId: number
          prisonerNumber: string
          movedIn: string
          movedOut: string
          firstName: string
          lastName: string
        }[]
      }): Chainable<AUTWindow>

      setupVisitsDetailsPageStubs(options: {
        prisonerNumber: string
        bookingId: number
        visitsOverrides?: VisitWithVisitors[]
      }): Chainable<AUTWindow>

      setupHealthPings(options: { httpStatus: number }): Chainable<AUTWindow>

      setupHealthAndMedicationRefDataStubs(options: {
        foodAllergies?: ReferenceDataCode[]
        medicalDiets?: ReferenceDataCode[]
        personalisedDiets?: ReferenceDataCode[]
        smokerCodes?: ReferenceDataCode[]
      }): Chainable<AUTWindow>
    }
  }
}
