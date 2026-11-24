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

/** Payload expected by HMPPS audit service */
interface AuditMessage {
  what: string
  when: Date
  who: string
  subjectId: string
  subjectType?: SubjectType
  service: string
  correlationId: string
  details?: string
}

/** Internal incomplete message which is turned into `AuditMessage` */
interface PartialMessage extends Omit<AuditMessage, 'when' | 'service' | 'details'> {
  details?: object
  /** Reason for accessing high-profile prisoner, if any */
  justification: string | null
}

export default class implements AuditService {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string,
    private readonly build: string,
    private readonly serviceName: string,
    private readonly enabled: boolean,
  ) {}

  private async sendMessage(partialMessage: PartialMessage): Promise<void> {
    if (this.enabled) {
      if (partialMessage.justification !== null) {
        // eslint-disable-next-line no-param-reassign
        partialMessage.details = { ...partialMessage.details, justification: partialMessage.justification }
      }
      // eslint-disable-next-line no-param-reassign
      delete partialMessage?.justification
      const auditMessage: AuditMessage = {
        ...partialMessage,
        when: new Date(),
        service: this.serviceName,
        details: partialMessage.details ? JSON.stringify(partialMessage.details) : undefined,
      }
      try {
        const messageResponse = await this.sqsClient.send(
          new SendMessageCommand({
            MessageBody: JSON.stringify(auditMessage),
            QueueUrl: this.queueUrl,
          }),
        )
        logger.info(`Message sent to audit (${messageResponse.MessageId})`)
      } catch (error) {
        logger.error('Problem sending message to audit', error)
      }
    }
  }

  sendAccessAttempt({ user, prisonerNumber, page, correlationId, justification }: AccessAttemptAudit) {
    return this.sendMessage({
      what: `ACCESS_ATTEMPT_${page}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: { build: this.build, userRoles: user.userRoles },
      justification,
    })
  }

  sendPageView({ user, prisonerNumber, prisonId, page, correlationId, justification }: PageViewAudit) {
    const details = {
      globalView: !isInUsersCaseLoad(prisonId, user),
      releasedPrisonerView: ['OUT', 'TRN'].includes(prisonId),
      // TODO: flag if high-profile?
      userRoles: user.userRoles,
      build: this.build,
    }

    return this.sendMessage({
      what: `PAGE_VIEW_${page}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details,
      justification,
    })
  }

  sendSearch({ user, prisonerNumber, searchPage, details, correlationId, justification }: SearchAudit) {
    // TODO: flag if high-profile?
    return this.sendMessage({
      what: `SEARCH_${searchPage}`,
      correlationId,
      details: { build: this.build, ...details },
      subjectId: prisonerNumber,
      subjectType: SubjectType.SearchTerm,
      who: user.username,
      justification,
    })
  }

  sendPostAttempt({ user, prisonerNumber, action, correlationId, details, justification }: PostAudit) {
    return this.sendMessage({
      what: `POST_${action}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: { build: this.build, ...details },
      justification,
    })
  }

  sendPostSuccess({ user, prisonerNumber, action, correlationId, details, justification }: PostAudit) {
    return this.sendMessage({
      what: `POST_SUCCESS_${action}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: { build: this.build, ...details },
      justification,
    })
  }

  sendPutAttempt({ user, prisonerNumber, action, correlationId, details, justification }: PutAudit) {
    return this.sendMessage({
      what: `PUT_${action}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: { build: this.build, ...details },
      justification,
    })
  }

  sendPutSuccess({ user, prisonerNumber, action, correlationId, details, justification }: PutAudit) {
    return this.sendMessage({
      what: `PUT_SUCCESS_${action}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: { build: this.build, ...details },
      justification,
    })
  }

  sendEvent(event: SendEvent) {
    return this.sendMessage(event)
  }
}
