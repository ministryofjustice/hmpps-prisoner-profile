import * as headerMappers from '../mappers/headerMappers'
import CaseNotesController from './caseNotesController'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import { caseNoteUsageMock } from '../data/localMockData/caseNoteUsageMock'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import CaseNotesService from '../services/caseNotesService'
import { caseNoteTypesMock } from '../data/localMockData/caseNoteTypesMock'
import { formatDate } from '../utils/dateHelpers'
import config from '../config'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { prisonApiAdditionalCaseNoteTextLength } from '../validators/updateCaseNoteValidator'
import { UpdateCaseNoteForm } from '../interfaces/caseNotesApi/caseNote'

let req: any
let res: any
let controller: any

jest.mock('../services/caseNotesService.ts')
jest.mock('../data/prisonApiClient.ts')

describe('Case Notes Controller', () => {
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
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
      middleware: {
        prisonerData: PrisonerMockDataA,
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
          username: 'AB123456',
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
    controller = new CaseNotesController(() => prisonApiClient, new CaseNotesService(null), auditServiceMock())
  })

  it('should get case notes', async () => {
    const getCaseNotesSpy = jest.spyOn<any, string>(controller['caseNotesService'], 'get').mockResolvedValue({
      pagedCaseNotes: pagedCaseNotesMock,
      listMetadata: null,
      caseNoteTypes: caseNoteTypesMock,
      fullName: 'John Middle Names Saunders',
    })
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')
    prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)

    await controller.displayCaseNotes()(req, res)

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
    expect(mapSpy).toHaveBeenCalledWith(PrisonerMockDataA, inmateDetailMock, res.locals.user, 'case-notes')
  })

  it('should display add case note page', async () => {
    const getCaseNoteTypesForUserSpy = jest
      .spyOn<any, string>(controller['caseNotesService'], 'getCaseNoteTypesForUser')
      .mockResolvedValue(caseNoteTypesMock.slice(0, 2))

    await controller.displayAddCaseNote()(req, res)

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

  it('should display update case note page', async () => {
    const currentCaseNote = pagedCaseNotesMock.content[0]
    const currentLength =
      currentCaseNote.text.length +
      currentCaseNote.amendments[0].additionalNoteText.length +
      prisonApiAdditionalCaseNoteTextLength +
      currentCaseNote.amendments[0].authorUserName.length
    const getCaseNoteSpy = jest
      .spyOn<any, string>(controller['caseNotesService'], 'getCaseNote')
      .mockResolvedValue(currentCaseNote)
    req.params.caseNoteId = 'abc123'

    await controller.displayUpdateCaseNote()(req, res)

    expect(getCaseNoteSpy).toHaveBeenCalledWith(res.locals.user.token, req.params.prisonerNumber, req.params.caseNoteId)
    expect(res.render).toHaveBeenCalledWith('pages/caseNotes/updateCaseNote', {
      refererUrl: `/prisoner/${PrisonerMockDataA.prisonerNumber}/case-notes`,
      caseNoteText: '',
      currentCaseNote,
      maxLength: 4000 - currentLength - prisonApiAdditionalCaseNoteTextLength - res.locals.user.username.length,
      isOMICOpen: false,
      isExternal: false,
      prisonerDisplayName: 'John Saunders',
      prisonerNumber: PrisonerMockDataA.prisonerNumber,
      currentLength,
      errors: undefined,
    })
  })

  describe('Handle update case note POST', () => {
    it('should update case note', async () => {
      const updateCaseNoteForm: UpdateCaseNoteForm = {
        text: 'Note text',
        isExternal: false,
        username: 'AB123456',
        currentLength: 100,
      }
      const caseNoteId = 'abc123'

      req = {
        params: {
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
          caseNoteId,
        },
        body: {
          ...updateCaseNoteForm,
          refererUrl: 'http://referer',
        },
        flash: jest.fn(),
      }
      const updateCaseNoteSpy = jest
        .spyOn<any, string>(controller['caseNotesService'], 'updateCaseNote')
        .mockResolvedValue(pagedCaseNotesMock.content[0])

      await controller.postUpdate()(req, res)

      expect(updateCaseNoteSpy).toHaveBeenCalledWith(
        res.locals.user.token,
        PrisonerMockDataA.prisonerNumber,
        caseNoteId,
        updateCaseNoteForm,
      )
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/case-notes`)
    })
  })
})
