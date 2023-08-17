import * as headerMappers from '../mappers/headerMappers'
import CaseNotesController from './caseNotesController'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import { caseNoteUsageMock } from '../data/localMockData/caseNoteUsageMock'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonerSearchService } from '../services'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import CaseNotesService from '../services/caseNotesService'
import { caseNoteTypesMock } from '../data/localMockData/caseNoteTypesMock'
import { formatDate } from '../utils/dateHelpers'
import config from '../config'

let req: any
let res: any
let controller: any

jest.mock('../services/prisonerSearch.ts')
jest.mock('../services/caseNotesService.ts')
jest.mock('../data/prisonApiClient.ts')

describe('Case Notes Controller', () => {
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'A9999AA' },
      query: {
        page: '0',
        sort: 'dateCreated,ASC',
        type: 'ACP',
        subType: 'ASSESSMENT',
        startDate: '01/01/2023',
        endDate: '02/02/2023',
      },
      headers: {
        referer: 'http://referer',
      },
      path: 'case-notes',
      session: {
        userDetails: { displayName: 'A Name' },
      },
      flash: jest.fn(),
    }
    res = {
      locals: {
        clientToken: 'CLIENT_TOKEN',
        user: {
          userRoles: [Role.DeleteSensitiveCaseNotes],
          staffId: 487023,
          caseLoads: CaseLoadsDummyDataA,
          token: 'USER_TOKEN',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    }

    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getCaseNotesUsage = jest.fn(async () => caseNoteUsageMock)
    controller = new CaseNotesController(
      () => prisonApiClient,
      new PrisonerSearchService(null),
      new CaseNotesService(null),
    )
  })

  it('should get case notes', async () => {
    const getPrisonerDetailsSpy = jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(PrisonerMockDataA)
    const getCaseNotesSpy = jest.spyOn<any, string>(controller['caseNotesService'], 'get').mockResolvedValue({
      pagedCaseNotes: pagedCaseNotesMock,
      listMetadata: null,
      caseNoteTypes: caseNoteTypesMock,
      fullName: 'John Middle Names Saunders',
    })
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayCaseNotes()(req, res)

    expect(getPrisonerDetailsSpy).toHaveBeenCalledWith(res.locals.clientToken, req.params.prisonerNumber)
    expect(prisonApiClient.getCaseNotesUsage).toHaveBeenCalledWith(req.params.prisonerNumber)
    expect(getCaseNotesSpy).toHaveBeenCalledWith(
      res.locals.user.token,
      PrisonerMockDataA,
      {
        page: 0,
        sort: 'dateCreated,ASC',
        type: 'ACP',
        subType: 'ASSESSMENT',
        startDate: '01/01/2023',
        endDate: '02/02/2023',
      },
      true,
      { displayName: 'A Name' },
    )
    expect(mapSpy).toHaveBeenCalledWith(PrisonerMockDataA, res.locals.user, 'case-notes')
  })

  it('should display add case note page', async () => {
    const getPrisonerDetailsSpy = jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(PrisonerMockDataA)
    const getCaseNoteTypesForUserSpy = jest
      .spyOn<any, string>(controller['caseNotesService'], 'getCaseNoteTypesForUser')
      .mockResolvedValue(caseNoteTypesMock.slice(0, 2))

    await controller.displayAddCaseNote()(req, res)

    expect(getPrisonerDetailsSpy).toHaveBeenCalledWith(res.locals.clientToken, req.params.prisonerNumber)
    expect(getCaseNoteTypesForUserSpy).toHaveBeenCalledWith(res.locals.user.token)
    expect(res.render).toHaveBeenCalledWith('pages/caseNotes/addCaseNote', {
      today: formatDate(new Date().toISOString(), 'short'),
      refererUrl: req.headers.referer,
      prisonerDisplayName: 'John Saunders',
      prisonerNumber: PrisonerMockDataA.prisonerNumber,
      formValues: {
        date: formatDate(new Date().toISOString(), 'short'),
        hours: new Date().getHours().toString().padStart(2, '0'),
        minutes: new Date().getMinutes().toString().padStart(2, '0'),
        subType: 'ASSESSMENT',
        text: '',
        type: 'ACP',
      },
      types: [
        {
          text: 'Accredited Programme',
          value: 'ACP',
        },
        {
          text: 'OMiC',
          value: 'OMIC',
        },
      ],
      subTypes: [
        {
          text: 'Assessment',
          value: 'ASSESSMENT',
        },
      ],
      typeSubTypeMap: {
        ACP: [
          {
            text: 'Assessment',
            value: 'ASSESSMENT',
          },
        ],
        OMIC: [
          {
            text: 'Open Case Note',
            value: 'OPEN_COMM',
          },
        ],
      },
      behaviourPrompts: expect.objectContaining({}),
      errors: undefined,
    })
  })

  describe('Handle add case note POST', () => {
    it('should save case note and redirect to record incentive level page', async () => {
      const caseNoteForm = {
        type: 'REPORTS',
        subType: 'REP_IEP',
        text: 'Note text',
        date: '01/01/2023',
        hours: '16',
        minutes: '30',
      }
      req = {
        params: {
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
        },
        body: {
          ...caseNoteForm,
          refererUrl: 'http://referer',
        },
        flash: jest.fn(),
      }
      const addCaseNoteSpy = jest
        .spyOn<any, string>(controller['caseNotesService'], 'addCaseNote')
        .mockResolvedValue(pagedCaseNotesMock.content[0])

      await controller.post()(req, res)

      expect(addCaseNoteSpy).toHaveBeenCalledWith(res.locals.user.token, PrisonerMockDataA.prisonerNumber, caseNoteForm)
      expect(res.redirect).toHaveBeenCalledWith(
        `${config.serviceUrls.digitalPrison}/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note/record-incentive-level`,
      )
    })
  })
})
