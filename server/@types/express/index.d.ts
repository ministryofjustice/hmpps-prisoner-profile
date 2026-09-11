import type { UUID } from 'node:crypto'
import type { SharedData } from '@ministryofjustice/hmpps-connect-dps-components'
import type { PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import type HmppsError from '../../interfaces/HmppsError'
import type { HmppsUser } from '../../interfaces/HmppsUser'
import type { AlertSummaryData } from '../../data/interfaces/alertsApi/Alert'
import type InmateDetail from '../../data/interfaces/prisonApi/InmateDetail'
import type Prisoner from '../../data/interfaces/prisonerSearchApi/Prisoner'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    userBackLink?: { url: string; text: string }
    movementSlipData: object
    temporaryDataCache: Record<UUID, unknown>
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
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
    }
  }
}
