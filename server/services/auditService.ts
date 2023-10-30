import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import logger from '../../logger'

export interface PageViewAudit {
  userId: string
  prisonerNumber: string

  // This should contain things relevant to auditing, ideas:
  // Page name   - the page that was viewed
  // Global View - whether or not it was the restricted global view
  // Users roles - the users roles to determine what they could see
  details: { pageName: string; isGlobalView: boolean; usersRoles: string[] }
}

export interface AuditService {
  sendPageView: ({ userId, prisonerNumber, details }: PageViewAudit) => Promise<void>
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
  const sendPageView = async ({ userId, prisonerNumber, details }: PageViewAudit) => {
    try {
      const message = JSON.stringify({
        action: 'PAGE_VIEW',
        when: new Date(),
        who: userId,
        subjectId: prisonerNumber,
        subjectType: 'PRISONER_ID',
        service: serviceName,
        details: { ...details, build },
      })

      const messageResponse = await sqsClient.send(new SendMessageCommand({ MessageBody: message, QueueUrl: queueUrl }))
      logger.info(`Page view sent to audit (${messageResponse.MessageId})`)
    } catch (error) {
      logger.error('Problem sending page view to audit', error)
    }
  }

  return {
    sendPageView,
  }
}
