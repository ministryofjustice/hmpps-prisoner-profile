import { PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { UUID } from 'crypto'
import HmppsError from '../../interfaces/HmppsError'
import { HmppsUser } from '../../interfaces/HmppsUser'
import Prisoner from '../../data/interfaces/prisonerSearchApi/Prisoner'
import { AlertSummaryData } from '../../data/interfaces/alertsApi/Alert'
import InmateDetail from '../../data/interfaces/prisonApi/InmateDetail'

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
        usingGuard?: number
        errors?: { [key: number]: Error[] }
      }

      logout(done: (err: unknown) => void): void

      flash(type: string, message: unknown): number
    }

    interface Locals {
      user: HmppsUser
      prisonerPermissions?: PrisonerPermissions
    }
  }
}
