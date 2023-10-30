import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import logger from '../../logger'

// The individual pages that contain user information
// eslint-disable-next-line no-shadow
export enum PageViewAction {
  OverviewPage = 'PAGE_VIEW_OVERVIEW',
}

export interface PageViewAudit {
  userId: string
  prisonerNumber: string
  pageViewAction: PageViewAction
  details: { globalView: boolean; releasedPrisonerView: boolean; userRoles: string[] }
}

interface AddAppointmentAudit {
  userId: string
  prisonerNumber: string
  details: object
}

type SearchActions = 'SEARCH_CASE_NOTES' | 'SEARCH_ALERTS'

interface SearchAudit {
  userId: string
  prisonerNumber: string
  searchAction: SearchActions
  details: object
}

export interface AuditService {
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

  const sendPageView = async ({ userId, prisonerNumber, details, pageViewAction }: PageViewAudit) => {
    const message = JSON.stringify({
      action: pageViewAction.toString(),
      when: new Date(),
      who: userId,
      subjectId: prisonerNumber,
      subjectType: 'PRISONER_ID',
      service: serviceName,
      details: { ...details, build },
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
    sendPageView,
    sendAddAppointment,
    sendSearch,
  }
}
