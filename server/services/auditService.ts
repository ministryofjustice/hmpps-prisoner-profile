import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import logger from '../../logger'
import { CaseLoad } from '../interfaces/caseLoad'
import { prisonerBelongsToUsersCaseLoad } from '../utils/utils'

// The individual pages that contain user information
// eslint-disable-next-line no-shadow
export enum Page {
  Offences = 'OFFENCES',
  Overview = 'OVERVIEW',
  Personal = 'PERSONAL',
  Photo = 'PHOTO',
  WorkAndSkills = 'WORK_AND_SKILLS',
}

export interface AccessAttemptAudit {
  userId: string
  userRoles: string
  prisonerNumber: string
  page: Page
  requestId: string
}

export interface PageViewAudit {
  userId: string
  userCaseLoads: CaseLoad[]
  userRoles: string[]
  prisonerNumber: string
  prisonId: string
  page: Page
  requestId: string
}

interface AddAppointmentAudit {
  userId: string
  prisonerNumber: string
  requestId: string
  details: object
}

type SearchActions = 'SEARCH_CASE_NOTES' | 'SEARCH_ALERTS'

interface SearchAudit {
  userId: string
  prisonerNumber: string
  requestId: string
  searchAction: SearchActions
  details: object
}

export interface AuditService {
  sendAccessAttempt: (object: AccessAttemptAudit) => Promise<void>
  sendPageView: (object: PageViewAudit) => Promise<void>
  sendAddAppointment: (object: AddAppointmentAudit) => Promise<void>
  sendSearch: (object: SearchAudit) => Promise<void>
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

  const sendAccessAttempt = async ({ userId, userRoles, prisonerNumber, page, requestId }: AccessAttemptAudit) => {
    const message = JSON.stringify({
      action: `ACCESS_ATTEMPT_${page.toString()}`,
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: 'PRISONER_ID',
      service: serviceName,
      requestId, // To be renamed when documentation is updated
      details: { build, userRoles },
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
    requestId,
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
      requestId, // To be renamed when documentation is updated
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

  const sendSearch = async ({ userId, prisonerNumber, searchAction, details }: SearchAudit) => {
    const message = JSON.stringify({
      action: searchAction,
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
  }
}
