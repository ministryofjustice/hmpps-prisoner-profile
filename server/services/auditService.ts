import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import logger from '../../logger'
import { CaseLoad } from '../interfaces/caseLoad'
import { prisonerBelongsToUsersCaseLoad } from '../utils/utils'

// The individual pages that contain user information
// eslint-disable-next-line no-shadow
export enum Page {
  ActiveAlerts = 'ACTIVE_ALERTS',
  ActivePunishments = 'ACTIVE_PUNISHMENTS',
  AddAlert = 'ADD_ALERT',
  AddCaseNote = 'ADD_CASE_NOTE',
  Alerts = 'ALERTS',
  CaseNotes = 'CASE_NOTES',
  InactiveAlerts = 'INACTIVE_ALERTS',
  MoneyDamageObligations = 'MONEY_DAMAGE_OBLIGATIONS',
  MoneyPrivateCash = 'MONEY_PRIVATE_CASH',
  MoneySavings = 'MONEY_SAVINGS',
  MoneySpends = 'MONEY_SPENDS',
  Offences = 'OFFENCES',
  Overview = 'OVERVIEW',
  Personal = 'PERSONAL',
  Photo = 'PHOTO',
  PostAddAlert = 'POST_ADD_ALERT',
  PostAddCaseNote = 'POST_ADD_CASE_NOTE',
  PrisonerCellHistory = 'PRISONER_CELL_HISTORY',
  Schedule = 'SCHEDULE',
  WorkAndSkills = 'WORK_AND_SKILLS',
  XRayBodyScans = 'XRAY_BODY_SCANS',
}

// eslint-disable-next-line no-shadow
export enum PostAction {
  Alert = 'ALERT',
  Appointment = 'APPOINTMENT',
  CaseNote = 'CASE_NOTE',
}

// eslint-disable-next-line no-shadow
export enum SearchPage {
  Alerts = 'SEARCH_ALERTS',
  CaseNotes = 'SEARCH_CASE_NOTES',
}

export interface AccessAttemptAudit {
  userId: string
  userRoles: string
  prisonerNumber: string
  page: Page
  correlationId: string
}

export interface PageViewAudit {
  userId: string
  userCaseLoads: CaseLoad[]
  userRoles: string[]
  prisonerNumber: string
  prisonId: string
  page: Page
  correlationId: string
}

interface AddAppointmentAudit {
  userId: string
  prisonerNumber: string
  correlationId: string
  details: object
}

interface SearchAudit {
  userId: string
  userCaseLoads: CaseLoad[]
  userRoles: string[]
  prisonerNumber: string
  prisonId: string
  correlationId: string
  searchPage: SearchPage
  details: object
}

interface PostAudit {
  userId: string
  userCaseLoads: CaseLoad[]
  prisonerNumber: string
  correlationId: string
  action: PostAction
  details: object
}

export interface AuditService {
  sendAccessAttempt: (object: AccessAttemptAudit) => Promise<void>
  sendPageView: (object: PageViewAudit) => Promise<void>
  sendAddAppointment: (object: AddAppointmentAudit) => Promise<void>
  sendSearch: (object: SearchAudit) => Promise<void>
  sendPostAttempt: (object: PostAudit) => Promise<void>
  sendPostSuccess: (object: PostAudit) => Promise<void>
}

/*
  build: the commit hash
*/
export const auditService = ({
  sqsClient,
  queueUrl,
  build,
  serviceName,
}: {
  sqsClient: SQSClient
  queueUrl: string
  build: string
  serviceName: string
}): AuditService => {
  const sendMessage = async (message: string) => {
    try {
      const messageResponse = await sqsClient.send(new SendMessageCommand({ MessageBody: message, QueueUrl: queueUrl }))
      logger.info(`Page view sent to audit (${messageResponse.MessageId})`)
    } catch (error) {
      logger.error('Problem sending page view to audit', error)
    }
  }

  const sendAccessAttempt = async ({ userId, userRoles, prisonerNumber, page, correlationId }: AccessAttemptAudit) => {
    const message = JSON.stringify({
      action: `ACCESS_ATTEMPT_${page.toString()}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: 'PRISONER_ID',
      service: serviceName,
      correlationId,
      details: { build, userRoles },
    })

    await sendMessage(message)
  }

  const sendPostAttempt = async ({ userId, prisonerNumber, action, correlationId, details }: PostAudit) => {
    const message = JSON.stringify({
      action: `POST_${action.toString()}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: 'PRISONER_ID',
      service: serviceName,
      correlationId,
      details: { build, ...details },
    })

    await sendMessage(message)
  }

  const sendPostSuccess = async ({ userId, prisonerNumber, action, correlationId, details }: PostAudit) => {
    const message = JSON.stringify({
      action: `POST_SUCCESS_${action.toString()}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: 'PRISONER_ID',
      service: serviceName,
      correlationId,
      details: { build, ...details },
    })

    await sendMessage(message)
  }

  const sendPageView = async ({
    userId,
    userCaseLoads,
    userRoles,
    prisonerNumber,
    prisonId,
    page,
    correlationId,
  }: PageViewAudit) => {
    const details = {
      globalView: !prisonerBelongsToUsersCaseLoad(prisonId, userCaseLoads),
      releasedPrisonerView: ['OUT', 'TRN'].includes(prisonId),
      userRoles,
      build,
    }

    const message = JSON.stringify({
      action: `PAGE_VIEW_${page.toString()}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: 'PRISONER_ID',
      service: serviceName,
      correlationId, // To be renamed when documentation is updated
      details,
    })

    await sendMessage(message)
  }

  const sendAddAppointment = async ({ userId, prisonerNumber, details }: AddAppointmentAudit) => {
    const message = JSON.stringify({
      action: 'ADD_APPOINTMENT',
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: 'PRISONER_ID',
      service: serviceName,
      details: { ...details, build },
    })

    await sendMessage(message)
  }

  const sendSearch = async ({ userId, prisonerNumber, searchPage, details }: SearchAudit) => {
    const message = JSON.stringify({
      action: `SEARCH_${searchPage}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: 'PRISONER_ID',
      service: serviceName,
      details: { ...details, build },
    })

    await sendMessage(message)
  }

  return {
    sendAccessAttempt,
    sendPageView,
    sendAddAppointment,
    sendSearch,
    sendPostAttempt,
    sendPostSuccess,
  }
}
