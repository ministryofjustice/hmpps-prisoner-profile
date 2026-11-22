import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import config from '../config'
import { Role } from '../data/enums/role'
import type { CaseNotesListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import { prisonUserMock } from '../data/localMockData/user'
import { Page } from './interfaces/auditService/page'
import { ApiAction, PostAction, PutAction, SearchAction } from './interfaces/auditService/actions'
import { SubjectType } from './interfaces/auditService/subjectType'
import AuditService from './auditService'

jest.mock('@aws-sdk/client-sqs')

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
  const auditService = AuditService({
    sqsClient,
    queueUrl: config.audit.queueUrl,
    serviceName: config.audit.serviceName,
    build: config.gitRef,
    enabled: true,
  })

  const expectMessageSent = (expectedMessage: object, expectedDetails?: object) => {
    expect(sqsClient.send).toHaveBeenCalled()
    const { MessageBody, QueueUrl } = jest.mocked(SendMessageCommand).mock.calls[0][0]
    expect(QueueUrl).toEqual(config.audit.queueUrl)
    const message = JSON.parse(MessageBody)
    expect(message).toEqual({ ...expectedMessage, details: expectedDetails ? expect.any(String) : undefined })
    if (expectedDetails) {
      expect(JSON.parse(message.details)).toEqual(expectedDetails)
    }
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should send access attempt to SQS', async () => {
    await auditService.sendAccessAttempt({
      user,
      prisonerNumber,
      page: Page.Overview,
      correlationId: requestId,
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
    )
  })

  it('should send event to SQS', async () => {
    await auditService.sendEvent({
      who: user.username,
      subjectId: prisonerNumber,
      correlationId: requestId,
      what: `API_${ApiAction.PrisonerImage}`,
      subjectType: SubjectType.PrisonerId,
    })
    expectMessageSent({
      what: 'API_PRISONER_IMAGE',
      when: nowStr,
      who: 'JSMITH_GEN',
      subjectId: prisonerNumber,
      subjectType: 'PRISONER_ID',
      service: 'hmpps-prisoner-profile',
      correlationId: requestId,
    })
  })
})
