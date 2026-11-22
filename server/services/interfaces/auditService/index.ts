import type { HmppsUser } from '../../../interfaces/HmppsUser'
import type { ApiAction, PostAction, PutAction, SearchAction } from './actions'
import type { Page } from './page'
import { SubjectType } from './subjectType'

export interface AccessAttemptAudit {
  user: HmppsUser
  prisonerNumber: string
  page: Page | ApiAction
  correlationId: string
}

export interface PageViewAudit {
  user: HmppsUser
  prisonerNumber: string
  prisonId: string
  page: Page
  correlationId: string
}

export interface SearchAudit {
  user: HmppsUser
  prisonerNumber: string
  prisonId: string
  correlationId: string
  searchPage: SearchAction
  details: object
}

export interface PostAudit {
  user: HmppsUser
  prisonerNumber: string
  correlationId: string
  action: PostAction
  details: object
}

export interface PutAudit {
  user: HmppsUser
  prisonerNumber: string
  correlationId: string
  action: PutAction
  details: object
}

export interface SendEvent {
  what: string
  who: string
  subjectId: string
  subjectType?: SubjectType
  correlationId: string
  details?: string
}

export interface AuditService {
  sendAccessAttempt(object: AccessAttemptAudit): Promise<void>
  sendPageView(object: PageViewAudit): Promise<void>
  sendSearch(object: SearchAudit): Promise<void>
  sendPostAttempt(object: PostAudit): Promise<void>
  sendPostSuccess(object: PostAudit): Promise<void>
  sendPutAttempt(object: PutAudit): Promise<void>
  sendPutSuccess(object: PutAudit): Promise<void>
  sendEvent(object: SendEvent): Promise<void>
}
