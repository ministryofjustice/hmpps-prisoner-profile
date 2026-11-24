import type { UUID } from 'node:crypto'
import type SharedData from '@ministryofjustice/hmpps-connect-dps-components/dist/types/SharedData'
import type { PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import type HmppsError from '../../interfaces/HmppsError'
import type { HmppsUser } from '../../interfaces/HmppsUser'
import type { AlertSummaryData } from '../../data/interfaces/alertsApi/Alert'
import type InmateDetail from '../../data/interfaces/prisonApi/InmateDetail'
import type Prisoner from '../../data/interfaces/prisonerSearchApi/Prisoner'

export declare module 'express-session' {
  interface SessionData {
    returnTo: string
    userBackLink?: { url: string; text: string }
    movementSlipData: object
    temporaryDataCache: Record<UUID, unknown>
    /**
     * Justifications for accessing given high-profile prisoners’ information (keyed by prisoner number)
     * NB: currently set only for prison users on prisoners in prison, but outside their caseloads
     */
    justifiedHighProfilePrisonerAccess?: Record<string, string>
  }
}

export declare global {
  namespace Express {
    interface User extends HmppsUser {
      username: string
      token?: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      errors?: HmppsError[]
      middleware?: {
        clientToken?: string
        prisonerData?: Prisoner
        alertSummaryData?: AlertSummaryData
        inmateDetail?: InmateDetail
        duplicatePrisonerData?: Prisoner[]
        usingGuard?: number
        errors?: { [key: number]: Error[] }
      }

      logout(done: (err: unknown) => void): void

      flash(type: string, message: unknown): number
    }

    interface Locals {
      feComponents: {
        header: string
        footer: string
        cssIncludes: string[]
        jsIncludes: string[]
        sharedData: SharedData
      }
      user: HmppsUser
      prisonerPermissions?: PrisonerPermissions
      /** Whether current prisoner is high-profile */
      isHighProfilePrisoner?: boolean
      /** Whether current prisoner is high-profile, in prison but outside user’s caseloads */
      isHighProfilePrisonerOutsideCaseloads?: boolean
    }
  }
}
