import { NextFunction } from 'express'
import * as headerMappers from '../mappers/headerMappers'
import CaseNotesController from './caseNotesController'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import { caseNoteUsageMock } from '../data/localMockData/caseNoteUsageMock'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import CaseNotesService from '../services/caseNotesService'
import { caseNoteTypesMock } from '../data/localMockData/caseNoteTypesMock'
import { formatDate } from '../utils/dateHelpers'
import config from '../config'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { prisonApiAdditionalCaseNoteTextLength } from '../validators/updateCaseNoteValidator'
import UpdateCaseNoteForm from '../data/interfaces/caseNotesApi/UpdateCaseNoteForm'
import { HmppsUser } from '../interfaces/HmppsUser'
import { alertFlagLabels } from '../data/alertFlags/alertFlags'

let req: any
let res: any
let next: NextFunction
let controller: any

jest.mock('../services/caseNotesService.ts')
jest.mock('../data/prisonApiClient.ts')

describe('Case Notes Controller', () => {
  let prisonApiClient: PrisonApiClient

  const user: Partial<HmppsUser> = {
    authSource: 'nomis',
    displayName: 'A Name',
    username: 'AB123456',
    userRoles: [Role.DeleteSensitiveCaseNotes],
    staffId: 487023,
    caseLoads: CaseLoadsDummyDataA,
    token: 'USER_TOKEN',
  }

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
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
        alertFlags: alertFlagLabels,
      },
      path: 'case-notes',
      flash: jest.fn(),
    }
    res = {
      locals: {
        user,
      },
      render: jest.fn(),
      redirect: jest.fn(),
    }
    next = jest.fn()

    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getCaseNotesUsage = jest.fn(async () => caseNoteUsageMock)
    controller = new CaseNotesController(() => prisonApiClient, new CaseNotesService(null), auditServiceMock())
  })

  describe('displayCaseNotes', () => {
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
      expect(getCaseNotesSpy).toHaveBeenCalledWith({
        token: req.middleware.clientToken,
        prisonerData: PrisonerMockDataA,
        queryParams: {
          page: 0,
          sort: 'dateCreated,ASC',
          type: 'ACP',
          subType: 'ASSESSMENT',
          startDate: '01/01/2023',
          endDate: '02/02/2023',
        },
        canViewSensitiveCaseNotes: false,
        canDeleteSensitiveCaseNotes: true,
        currentUserDetails: user,
      })
      expect(mapSpy).toHaveBeenCalledWith(
        PrisonerMockDataA,
        inmateDetailMock,
        alertFlagLabels,
        res.locals.user,
        'case-notes',
      )
    })

    it.each([Role.PomUser, Role.ViewSensitiveCaseNotes, Role.AddSensitiveCaseNotes])(
      'should include sensitive case notes if user has appropriate role',
      async value => {
        const getCaseNotesSpy = jest.spyOn<any, string>(controller['caseNotesService'], 'get').mockResolvedValue({
          pagedCaseNotes: pagedCaseNotesMock,
          listMetadata: null,
          caseNoteTypes: caseNoteTypesMock,
          fullName: 'John Middle Names Saunders',
        })
        jest.spyOn(headerMappers, 'mapHeaderData')
        prisonApiClient.getInmateDetail = jest.fn(async () => inmateDetailMock)

        res.locals.user.userRoles = [value]

        await controller.displayCaseNotes()(req, res)

        expect(getCaseNotesSpy).toHaveBeenCalledWith({
          token: req.middleware.clientToken,
          prisonerData: PrisonerMockDataA,
          queryParams: {
            page: 0,
            sort: 'dateCreated,ASC',
            type: 'ACP',
            subType: 'ASSESSMENT',
            startDate: '01/01/2023',
            endDate: '02/02/2023',
          },
          canViewSensitiveCaseNotes: true,
          canDeleteSensitiveCaseNotes: false,
          currentUserDetails: user,
        })
      },
    )
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
      miniBannerData: {
        cellLocation: '1-1-035',
        prisonerName: 'Saunders, John',
        prisonerNumber: 'G6123VU',
      },
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
        ...req,
        params: {
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
        },
        body: {
          ...caseNoteForm,
          refererUrl: 'http://referer',
        },
      }
      const addCaseNoteSpy = jest
        .spyOn<any, string>(controller['caseNotesService'], 'addCaseNote')
        .mockResolvedValue(pagedCaseNotesMock.content[0])

      jest
        .spyOn<any, string>(controller['caseNotesService'], 'getCaseNoteTypesForUser')
        .mockResolvedValue([{ code: 'REPORTS' }])

      await controller.post()(req, res, next)

      expect(addCaseNoteSpy).toHaveBeenCalledWith(
        req.middleware.clientToken,
        PrisonerMockDataA.prisonerNumber,
        caseNoteForm,
      )
      expect(res.redirect).toHaveBeenCalledWith(
        `${config.serviceUrls.digitalPrison}/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note/record-incentive-level`,
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should not permit creation of a case note with wrong type', async () => {
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

      jest.spyOn<any, string>(controller['caseNotesService'], 'getCaseNoteTypesForUser').mockResolvedValue([])
      const addCaseNoteSpy = jest.spyOn<any, string>(controller['caseNotesService'], 'addCaseNote')

      await controller.post()(req, res, next)

      expect(addCaseNoteSpy).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('displayUpdateCaseNote', () => {
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

      expect(getCaseNoteSpy).toHaveBeenCalledWith(
        req.middleware.clientToken,
        req.params.prisonerNumber,
        req.params.caseNoteId,
      )

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

    it.each([Role.PomUser, Role.AddSensitiveCaseNotes])(
      'should display update page for a sensitive case note for the appropriate roles',
      async value => {
        res.locals.user.userRoles = [value]
        const currentCaseNote = { ...pagedCaseNotesMock.content[0], sensitive: true }

        jest.spyOn<any, string>(controller['caseNotesService'], 'getCaseNote').mockResolvedValue(currentCaseNote)

        await controller.displayUpdateCaseNote()(req, res, next)

        expect(res.render).toHaveBeenCalled()
      },
    )

    it('should not display update page for a sensitive case note when user is not permitted', async () => {
      res.locals.user.userRoles = []
      const currentCaseNote = { ...pagedCaseNotesMock.content[0], sensitive: true }

      jest.spyOn<any, string>(controller['caseNotesService'], 'getCaseNote').mockResolvedValue(currentCaseNote)

      await controller.displayUpdateCaseNote()(req, res, next)

      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
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
        ...req,
        params: {
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
          caseNoteId,
        },
        body: {
          ...updateCaseNoteForm,
          refererUrl: 'http://referer',
        },
      }
      const updateCaseNoteSpy = jest
        .spyOn<any, string>(controller['caseNotesService'], 'updateCaseNote')
        .mockResolvedValue(pagedCaseNotesMock.content[0])

      jest
        .spyOn<any, string>(controller['caseNotesService'], 'getCaseNote')
        .mockResolvedValue(pagedCaseNotesMock.content[0])

      await controller.postUpdate()(req, res)

      expect(updateCaseNoteSpy).toHaveBeenCalledWith(
        req.middleware.clientToken,
        PrisonerMockDataA.prisonerNumber,
        caseNoteId,
        updateCaseNoteForm,
      )
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/case-notes`)
    })

    it.each([Role.PomUser, Role.AddSensitiveCaseNotes])(
      'should permit update of a sensitive case note for the appropriate roles',
      async value => {
        res.locals.user.userRoles = [value]
        const currentCaseNote = { ...pagedCaseNotesMock.content[0], sensitive: true }
        req = {
          ...req,
          params: {
            prisonerNumber: PrisonerMockDataA.prisonerNumber,
          },
          body: {
            text: 'Note text',
            isExternal: false,
            username: 'AB123456',
            currentLength: 100,
            refererUrl: 'http://referer',
          },
        }

        const updateCaseNoteSpy = jest.spyOn<any, string>(controller['caseNotesService'], 'updateCaseNote')
        jest.spyOn<any, string>(controller['caseNotesService'], 'getCaseNote').mockResolvedValue(currentCaseNote)

        await controller.postUpdate()(req, res, next)

        expect(updateCaseNoteSpy).toHaveBeenCalled()
      },
    )

    it('should not permit update of sensitive case note when user is not permitted', async () => {
      res.locals.user.userRoles = []
      const currentCaseNote = { ...pagedCaseNotesMock.content[0], sensitive: true }
      req = {
        ...req,
        params: {
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
        },
        body: {
          text: 'Note text',
          isExternal: false,
          username: 'AB123456',
          currentLength: 100,
          refererUrl: 'http://referer',
        },
      }

      const updateCaseNoteSpy = jest.spyOn<any, string>(controller['caseNotesService'], 'updateCaseNote')
      jest.spyOn<any, string>(controller['caseNotesService'], 'getCaseNote').mockResolvedValue(currentCaseNote)

      await controller.postUpdate()(req, res, next)

      expect(updateCaseNoteSpy).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
})
