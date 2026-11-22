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

export default class implements AuditService {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string,
    private readonly build: string,
    private readonly serviceName: string,
    private readonly enabled: boolean,
  ) {}

  private async sendMessage(message: Omit<AuditMessage, 'when' | 'service'>): Promise<void> {
    if (this.enabled) {
      const msg: AuditMessage = {
        ...message,
        when: new Date(),
        service: this.serviceName,
      }
      try {
        const messageResponse = await this.sqsClient.send(
          new SendMessageCommand({
            MessageBody: JSON.stringify(msg),
            QueueUrl: this.queueUrl,
          }),
        )
        logger.info(`Message sent to audit (${messageResponse.MessageId})`)
      } catch (error) {
        logger.error('Problem sending message to audit', error)
      }
    }
  }

  sendAccessAttempt({ user, prisonerNumber, page, correlationId }: AccessAttemptAudit) {
    return this.sendMessage({
      what: `ACCESS_ATTEMPT_${page}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: JSON.stringify({ build: this.build, userRoles: user.userRoles }),
    })
  }

  sendPageView({ user, prisonerNumber, prisonId, page, correlationId }: PageViewAudit) {
    const details = {
      globalView: !isInUsersCaseLoad(prisonId, user),
      releasedPrisonerView: ['OUT', 'TRN'].includes(prisonId),
      userRoles: user.userRoles,
      build: this.build,
    }

    return this.sendMessage({
      what: `PAGE_VIEW_${page}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: JSON.stringify(details),
    })
  }

  sendSearch({ user, prisonerNumber, searchPage, details, correlationId }: SearchAudit) {
    return this.sendMessage({
      what: `SEARCH_${searchPage}`,
      correlationId,
      details: JSON.stringify({ build: this.build, ...details }),
      subjectId: prisonerNumber,
      subjectType: SubjectType.SearchTerm,
      who: user.username,
    })
  }

  sendPostAttempt({ user, prisonerNumber, action, correlationId, details }: PostAudit) {
    return this.sendMessage({
      what: `POST_${action}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: JSON.stringify({ build: this.build, ...details }),
    })
  }

  sendPostSuccess({ user, prisonerNumber, action, correlationId, details }: PostAudit) {
    return this.sendMessage({
      what: `POST_SUCCESS_${action}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: JSON.stringify({ build: this.build, ...details }),
    })
  }

  sendPutAttempt({ user, prisonerNumber, action, correlationId, details }: PutAudit) {
    return this.sendMessage({
      what: `PUT_${action}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: JSON.stringify({ build: this.build, ...details }),
    })
  }

  sendPutSuccess({ user, prisonerNumber, action, correlationId, details }: PutAudit) {
    return this.sendMessage({
      what: `PUT_SUCCESS_${action}`,
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      correlationId,
      details: JSON.stringify({ build: this.build, ...details }),
    })
  }

  sendEvent(event: SendEvent) {
    return this.sendMessage(event)
  }
}
