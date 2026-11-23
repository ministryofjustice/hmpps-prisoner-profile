import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import logger from '../../logger'
import config from '../config'
import { Role } from '../data/enums/role'
import type { CaseNotesListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import { prisonUserMock } from '../data/localMockData/user'
import { Page } from './interfaces/auditService/page'
import { ApiAction, PostAction, PutAction, SearchAction } from './interfaces/auditService/actions'
import { SubjectType } from './interfaces/auditService/subjectType'
import AuditService from './auditService'

jest.mock('@aws-sdk/client-sqs')
jest.mock('../../logger')

const user = { ...prisonUserMock, userRoles: [Role.PrisonUser] }
const prisonerNumber = 'G6123VU'
const requestId = 'requestId1231'

describe('AuditService', () => {
  const nowStr = '2026-11-22T13:14:15.000Z'
  const now = new Date(nowStr)

  beforeAll(() => {
    jest.useFakeTimers({ now })
    jest.setSystemTime(now)
  })

  const sqsClient = jest.mocked(new SQSClient({ region: config.audit.region }))
  sqsClient.send.mockResolvedValue({ MessageId: 'msg1' } as never)
  const auditService = new AuditService(sqsClient, config.audit.queueUrl, config.gitRef, config.audit.serviceName, true)

  const expectMessageSent = (
    expectedMessage: object,
    expectedDetails: object | undefined,
    justification: string | null,
  ) => {
    expect(logger.info).toHaveBeenCalledWith('Message sent to audit (msg1)')
    expect(sqsClient.send).toHaveBeenCalled()
    const { MessageBody, QueueUrl } = jest.mocked(SendMessageCommand).mock.calls[0][0]
    expect(QueueUrl).toEqual(config.audit.queueUrl)
    const message = JSON.parse(MessageBody)
    if (justification) {
      // eslint-disable-next-line no-param-reassign
      expectedDetails = { ...expectedDetails, justification }
    }
    expect(message).toEqual({ ...expectedMessage, details: expectedDetails ? expect.any(String) : undefined })
    if (expectedDetails) {
      expect(JSON.parse(message.details)).toEqual(expectedDetails)
    }
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe.each([
    { scenario: 'no justification is provided', justification: null },
    { scenario: 'justification is needed', justification: 'checking non-associations for work' },
  ])('when $scenario', ({ justification }) => {
    it('should send access attempt to SQS', async () => {
      await auditService.sendAccessAttempt({
        user,
        prisonerNumber,
        page: Page.Overview,
        correlationId: requestId,
        justification,
      })
      expectMessageSent(
        {
          what: 'ACCESS_ATTEMPT_OVERVIEW',
          when: nowStr,
          who: 'JSMITH_GEN',
          subjectId: prisonerNumber,
          subjectType: 'PRISONER_ID',
          service: 'hmpps-prisoner-profile',
          correlationId: requestId,
        },
        { build: 'xxxxxxxxxxxxxxxxxxx', userRoles: ['ROLE_PRISON'] },
        justification,
      )
    })

    it.each([
      {
        scenario: 'someone in caseloads',
        prisonId: user.activeCaseLoadId,
        globalView: false,
        releasedPrisonerView: false,
      },
      {
        scenario: 'someone outside caseloads',
        prisonId: 'LEI',
        globalView: true,
        releasedPrisonerView: false,
      },
      {
        scenario: 'someone in transfer',
        prisonId: 'TRN',
        globalView: true,
        releasedPrisonerView: true,
      },
      {
        scenario: 'someone who is released',
        prisonId: 'OUT',
        globalView: true,
        releasedPrisonerView: true,
      },
    ])('should send page view of $scenario to SQS', async ({ prisonId, globalView, releasedPrisonerView }) => {
      await auditService.sendPageView({
        user,
        prisonerNumber,
        prisonId,
        page: Page.Overview,
        correlationId: requestId,
        justification,
      })
      expectMessageSent(
        {
          what: 'PAGE_VIEW_OVERVIEW',
          when: nowStr,
          who: 'JSMITH_GEN',
          subjectId: prisonerNumber,
          subjectType: 'PRISONER_ID',
          service: 'hmpps-prisoner-profile',
          correlationId: requestId,
        },
        { build: 'xxxxxxxxxxxxxxxxxxx', userRoles: ['ROLE_PRISON'], globalView, releasedPrisonerView },
        justification,
      )
    })

    it('should send search action to SQS', async () => {
      await auditService.sendSearch({
        user,
        prisonerNumber,
        prisonId: user.activeCaseLoadId,
        searchPage: SearchAction.CaseNotes,
        correlationId: requestId,
        details: { queryParams: { type: 'POS', subType: 'POS_GEN', page: 1 } satisfies CaseNotesListQueryParams },
        justification,
      })
      expectMessageSent(
        {
          what: 'SEARCH_CASE_NOTES',
          when: nowStr,
          who: 'JSMITH_GEN',
          subjectId: prisonerNumber,
          subjectType: 'SEARCH_TERM',
          service: 'hmpps-prisoner-profile',
          correlationId: requestId,
        },
        { build: 'xxxxxxxxxxxxxxxxxxx', queryParams: { page: 1, subType: 'POS_GEN', type: 'POS' } },
        justification,
      )
    })

    it.each([
      { scenario: 'attempt', method: 'sendPostAttempt' as const, what: 'POST' },
      { scenario: 'success', method: 'sendPostSuccess' as const, what: 'POST_SUCCESS' },
    ])('should send post $scenario to SQS', async ({ method, what }) => {
      await auditService[method]({
        user,
        prisonerNumber,
        correlationId: requestId,
        action: PostAction.EditReligion,
        details: {
          fieldName: 'religion',
          previous: 'COFE',
          updated: 'NIL',
        },
        justification,
      })
      expectMessageSent(
        {
          what: `${what}_EDIT_RELIGION`,
          when: nowStr,
          who: 'JSMITH_GEN',
          subjectId: prisonerNumber,
          subjectType: 'PRISONER_ID',
          service: 'hmpps-prisoner-profile',
          correlationId: requestId,
        },
        { build: 'xxxxxxxxxxxxxxxxxxx', fieldName: 'religion', previous: 'COFE', updated: 'NIL' },
        justification,
      )
    })

    it.each([
      { scenario: 'attempt', method: 'sendPutAttempt' as const, what: 'PUT' },
      { scenario: 'success', method: 'sendPutSuccess' as const, what: 'PUT_SUCCESS' },
    ])('should send put $scenario to SQS', async ({ method, what }) => {
      await auditService[method]({
        user,
        prisonerNumber,
        correlationId: requestId,
        action: PutAction.CaseNote,
        details: { caseNoteId: '01a203ae-2274-71ac-a970-3d68d489d624' },
        justification,
      })
      expectMessageSent(
        {
          what: `${what}_UPDATE_CASE_NOTE`,
          when: nowStr,
          who: 'JSMITH_GEN',
          subjectId: prisonerNumber,
          subjectType: 'PRISONER_ID',
          service: 'hmpps-prisoner-profile',
          correlationId: requestId,
        },
        { build: 'xxxxxxxxxxxxxxxxxxx', caseNoteId: '01a203ae-2274-71ac-a970-3d68d489d624' },
        justification,
      )
    })

    it.each([
      {
        scenario: 'send event',
        extraProperties: {} as object,
        expectedDetails: undefined as object | undefined,
      },
      {
        scenario: 'send event with details',
        extraProperties: { details: { imageId: 1231 } } as object,
        expectedDetails: { imageId: 1231 } as object | undefined,
      },
    ])('should $scenario to SQS', async ({ extraProperties, expectedDetails }) => {
      await auditService.sendEvent({
        who: user.username,
        subjectId: prisonerNumber,
        correlationId: requestId,
        what: `API_${ApiAction.PrisonerImage}`,
        subjectType: SubjectType.PrisonerId,
        justification,
        ...extraProperties,
      })
      expectMessageSent(
        {
          what: 'API_PRISONER_IMAGE',
          when: nowStr,
          who: 'JSMITH_GEN',
          subjectId: prisonerNumber,
          subjectType: 'PRISONER_ID',
          service: 'hmpps-prisoner-profile',
          correlationId: requestId,
        },
        expectedDetails,
        justification,
      )
    })
  })
})
