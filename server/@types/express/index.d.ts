import { UserDetails } from '../../services/userService'
import HmppsError from '../../interfaces/HmppsError'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    userDetails: UserDetails
    userBackLink: string
    movementSlipData: object
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
      middleware?: Record
      logout(done: (err: unknown) => void): void
      flash(type: string, message: unknown): number
    }
  }
}
