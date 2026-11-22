import { SendMessageCommand, type SQSClient } from '@aws-sdk/client-sqs'
import logger from '../../logger'
import { isInUsersCaseLoad } from '../utils/utils'
import type {
  AccessAttemptAudit,
  AuditService,
  PageViewAudit,
  PostAudit,
  PutAudit,
  SearchAudit,
  SendEvent,
} from './interfaces/auditService'
import { SubjectType } from './interfaces/auditService/subjectType'

interface AuditMessage extends SendEvent {
  what: string
  when: Date
  who: string
  subjectId: string
  subjectType?: SubjectType
  service: string
  correlationId: string
  details?: string
}

export default ({
  sqsClient,
  queueUrl,
  build,
  serviceName,
  enabled,
}: {
  sqsClient: SQSClient
  queueUrl: string
  build: string
  serviceName: string
  enabled: boolean
}): AuditService => {
  const sendMessage = async (message: AuditMessage) => {
    if (enabled) {
      try {
        const messageResponse = await sqsClient.send(
          new SendMessageCommand({ MessageBody: JSON.stringify(message), QueueUrl: queueUrl }),
        )
        logger.info(`Page view sent to audit (${messageResponse.MessageId})`)
      } catch (error) {
        logger.error('Problem sending page view to audit', error)
      }
    }
  }

  const sendAccessAttempt = async ({ user, prisonerNumber, page, correlationId }: AccessAttemptAudit) => {
    await sendMessage({
      what: `ACCESS_ATTEMPT_${page.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, userRoles: user.userRoles }),
    })
  }

  const sendPostAttempt = async ({ user, prisonerNumber, action, correlationId, details }: PostAudit) => {
    await sendMessage({
      what: `POST_${action.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, ...details }),
    })
  }

  const sendPostSuccess = async ({ user, prisonerNumber, action, correlationId, details }: PostAudit) => {
    await sendMessage({
      what: `POST_SUCCESS_${action.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, ...details }),
    })
  }

  const sendPutAttempt = async ({ user, prisonerNumber, action, correlationId, details }: PutAudit) => {
    await sendMessage({
      what: `PUT_${action.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, ...details }),
    })
  }

  const sendPutSuccess = async ({ user, prisonerNumber, action, correlationId, details }: PutAudit) => {
    await sendMessage({
      what: `PUT_SUCCESS_${action.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, ...details }),
    })
  }

  const sendPageView = async ({ user, prisonerNumber, prisonId, page, correlationId }: PageViewAudit) => {
    const details = {
      globalView: !isInUsersCaseLoad(prisonId, user),
      releasedPrisonerView: ['OUT', 'TRN'].includes(prisonId),
      userRoles: user.userRoles,
      build,
    }

    await sendMessage({
      what: `PAGE_VIEW_${page.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify(details),
    })
  }

  const sendSearch = async ({ user, prisonerNumber, searchPage, details, correlationId }: SearchAudit) => {
    await sendMessage({
      what: `SEARCH_${searchPage}`,
      correlationId,
      details: JSON.stringify({ ...details, build }),
      service: serviceName,
      subjectId: prisonerNumber,
      subjectType: SubjectType.SearchTerm,
      when: new Date(),
      who: user.username,
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
    sendSearch,
    sendPostAttempt,
    sendPostSuccess,
    sendPutAttempt,
    sendPutSuccess,
    sendEvent,
  }
}
