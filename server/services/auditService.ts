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
  AddAppointment = 'ADD_APPOINTMENT',
  AddCaseNote = 'ADD_CASE_NOTE',
  Alerts = 'ALERTS',
  AppointmentConfirmation = 'APPOINTMENT_CONFIRMATION',
  AppointmentMovementSlips = 'APPOINTMENT_MOVEMENT_SLIPS',
  CaseNotes = 'CASE_NOTES',
  CsraHistory = 'CSRA_HISTORY',
  CsraReview = 'CSRA_REVIEW',
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
  PostAddAppointment = 'POST_ADD_APPOINTMENT',
  PostAddCaseNote = 'POST_ADD_CASE_NOTE',
  PostPrePostAppointments = 'POST_PRE_POST_APPOINTMENTS',
  PrePostAppointmentConfirmation = 'PRE_POST_APPOINTMENT_CONFIRMATION',
  PrePostAppointments = 'PRE_POST_APPOINTMENTS',
  PrisonerCellHistory = 'PRISONER_CELL_HISTORY',
  Schedule = 'SCHEDULE',
  WorkAndSkills = 'WORK_AND_SKILLS',
  XRayBodyScans = 'XRAY_BODY_SCANS',
}

// eslint-disable-next-line no-shadow
export enum ApiAction {
  Image = 'IMAGE',
  LocationEvents = 'LOCATION_EVENTS',
  OffenderEvents = 'OFFENDER_EVENTS',
  PrisonerImage = 'PRISONER_IMAGE',
}

// eslint-disable-next-line no-shadow
export enum PostAction {
  Alert = 'ALERT',
  Appointment = 'APPOINTMENT',
  CaseNote = 'CASE_NOTE',
}

// eslint-disable-next-line no-shadow
export enum SearchAction {
  Alerts = 'ALERTS',
  CaseNotes = 'CASE_NOTES',
}

// eslint-disable-next-line no-shadow
export enum SubjectType {
  PrisonerId = 'PRISONER_ID',
  SearchTerm = 'SEARCH_TERM',
}

export interface AccessAttemptAudit {
  userId: string
  userRoles: string
  prisonerNumber: string
  page: Page | ApiAction
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
  searchPage: SearchAction
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

interface SendEvent {
  action: string
  who: string
  subjectId: string
  subjectType?: SubjectType
  correlationId: string
  details?: object
}

export interface AuditService {
  sendAccessAttempt: (object: AccessAttemptAudit) => Promise<void>
  sendPageView: (object: PageViewAudit) => Promise<void>
  sendAddAppointment: (object: AddAppointmentAudit) => Promise<void>
  sendSearch: (object: SearchAudit) => Promise<void>
  sendPostAttempt: (object: PostAudit) => Promise<void>
  sendPostSuccess: (object: PostAudit) => Promise<void>
  sendEvent: (object: SendEvent) => Promise<void>
}

interface AuditMessage {
  action: string
  when: Date
  who: string
  subjectId: string
  subjectType?: SubjectType
  service: string
  correlationId: string
  details?: object
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
  const sendMessage = async (message: AuditMessage) => {
    try {
      const messageResponse = await sqsClient.send(
        new SendMessageCommand({ MessageBody: JSON.stringify(message), QueueUrl: queueUrl }),
      )
      logger.info(`Page view sent to audit (${messageResponse.MessageId})`)
    } catch (error) {
      logger.error('Problem sending page view to audit', error)
    }
  }

  const sendAccessAttempt = async ({ userId, userRoles, prisonerNumber, page, correlationId }: AccessAttemptAudit) => {
    await sendMessage({
      action: `ACCESS_ATTEMPT_${page.toString()}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: { build, userRoles },
    })
  }

  const sendPostAttempt = async ({ userId, prisonerNumber, action, correlationId, details }: PostAudit) => {
    await sendMessage({
      action: `POST_${action.toString()}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: { build, ...details },
    })
  }

  const sendPostSuccess = async ({ userId, prisonerNumber, action, correlationId, details }: PostAudit) => {
    await sendMessage({
      action: `POST_SUCCESS_${action.toString()}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: { build, ...details },
    })
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

    await sendMessage({
      action: `PAGE_VIEW_${page.toString()}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details,
    })
  }

  const sendAddAppointment = async ({ userId, prisonerNumber, details, correlationId }: AddAppointmentAudit) => {
    await sendMessage({
      action: 'ADD_APPOINTMENT',
      correlationId,
      details: { ...details, build },
      service: serviceName,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      when: new Date(),
      who: userId,
    })
  }

  const sendSearch = async ({ userId, prisonerNumber, searchPage, details, correlationId }: SearchAudit) => {
    await sendMessage({
      action: `SEARCH_${searchPage}`,
      correlationId,
      details: { ...details, build },
      service: serviceName,
      subjectId: prisonerNumber,
      subjectType: SubjectType.SearchTerm,
      when: new Date(),
      who: userId,
    })
  }

  const sendEvent = async (event: SendEvent) => {
    await sendMessage({
      service: serviceName,
      when: new Date(),
      ...event,
    })
  }

  return {
    sendAccessAttempt,
    sendPageView,
    sendAddAppointment,
    sendSearch,
    sendPostAttempt,
    sendPostSuccess,
    sendEvent,
  }
}
