import { NextFunction, Request, Response } from 'express'
import { CaseNotesPermission, PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import * as headerMappers from '../mappers/headerMappers'
import CaseNotesController from './caseNotesController'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import CaseNotesService from '../services/caseNotesService'
import { caseNoteTypesMock } from '../data/localMockData/caseNoteTypesMock'
import { formatDate } from '../utils/dateHelpers'
import config from '../config'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { prisonApiAdditionalCaseNoteTextLength } from '../validators/updateCaseNoteValidator'
import { HmppsUser } from '../interfaces/HmppsUser'
import CaseNotesPageData from '../services/interfaces/caseNotesService/CaseNotesPageData'
import mockPermissions from '../../tests/mocks/mockPermissions'

let req: Request
let res: Response
let next: NextFunction
let controller: CaseNotesController

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')
jest.mock('../services/caseNotesService.ts')
jest.mock('../data/prisonApiClient.ts')

const prisonerPermissions = {} as PrisonerPermissions

const { prisonerNumber } = PrisonerMockDataA

describe('Case Notes Controller', () => {
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
        alertSummaryData: {
          alertFlags: [],
        },
      },
      path: 'case-notes',
      flash: jest.fn(),
    } as unknown as Request
    res = {
      locals: {
        user,
        prisonerPermissions,
        prisonerNumber,
        prisonerName: {
          firstLast: 'John Saunders',
          lastCommaFirst: 'Saunders, John',
          full: 'John Middle Names Saunders',
        },
        prisonId: PrisonerMockDataA.prisonId,
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
    next = jest.fn()

    controller = new CaseNotesController(new CaseNotesService(null), auditServiceMock())
    mockPermissions({
      [CaseNotesPermission.read_sensitive]: false,
      [CaseNotesPermission.edit_sensitive]: false,
    })
  })

  describe('displayCaseNotes', () => {
    it('should get case notes', async () => {
      const getCaseNotesSpy = jest.spyOn(controller.caseNotesService, 'get').mockResolvedValue({
        pagedCaseNotes: pagedCaseNotesMock,
        listMetadata: null,
        caseNoteTypes: caseNoteTypesMock,
        fullName: 'John Middle Names Saunders',
      } as CaseNotesPageData)
      const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

      await controller.displayCaseNotes()(req, res, next)

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
        canDeleteSensitiveCaseNotes: false,
        currentUserDetails: user,
      })
      expect(mapSpy).toHaveBeenCalledWith(
        PrisonerMockDataA,
        inmateDetailMock,
        req.middleware.alertSummaryData,
        res.locals.user,
        res.locals.prisonerPermissions,
        'case-notes',
      )
    })

    it('should handle API being unavailable', async () => {
      jest.spyOn(controller.caseNotesService, 'get').mockRejectedValue(new Error())

      await controller.displayCaseNotes()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        'pages/caseNotes/caseNotesPage',
        expect.objectContaining({
          caseNotesApiUnavailable: true,
        }),
      )
    })

    it('should allow view of sensitive case notes if user has the appropriate permission', async () => {
      const getCaseNotesSpy = jest.spyOn(controller.caseNotesService, 'get').mockResolvedValue({
        pagedCaseNotes: pagedCaseNotesMock,
        listMetadata: null,
        caseNoteTypes: caseNoteTypesMock,
        fullName: 'John Middle Names Saunders',
      } as CaseNotesPageData)
      jest.spyOn(headerMappers, 'mapHeaderData')
      mockPermissions({ [CaseNotesPermission.read_sensitive]: true })

      await controller.displayCaseNotes()(req, res, next)

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
    })
  })

  it('should display add case note page', async () => {
    const getCaseNoteTypesForUserSpy = jest
      .spyOn(controller.caseNotesService, 'getCaseNoteTypesForUser')
      .mockResolvedValue(caseNoteTypesMock.slice(0, 2))

    await controller.displayAddCaseNote()(req, res, next)

    expect(getCaseNoteTypesForUserSpy).toHaveBeenCalledWith({
      token: req.middleware.clientToken,
      canEditSensitiveCaseNotes: false,
    })
    expect(res.render).toHaveBeenCalledWith('pages/caseNotes/addCaseNote', {
      today: formatDate(new Date().toISOString(), 'short'),
      refererUrl: req.headers.referer,
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
        prisonerPermissions: {},
        prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
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
      } as unknown as Request
      const addCaseNoteSpy = jest
        .spyOn(controller.caseNotesService, 'addCaseNote')
        .mockResolvedValue(pagedCaseNotesMock.content[0])

      jest
        .spyOn(controller.caseNotesService, 'getCaseNoteTypesForUser')
        .mockResolvedValue([{ code: 'REPORTS', description: 'Reports', subCodes: [] }])

      await controller.post()(req, res, next)

      expect(addCaseNoteSpy).toHaveBeenCalledWith(
        req.middleware.clientToken,
        PrisonerMockDataA.prisonerNumber,
        'MDI',
        caseNoteForm,
      )
      expect(res.redirect).toHaveBeenCalledWith(
        `${config.serviceUrls.digitalPrison}/prisoner/${PrisonerMockDataA.prisonerNumber}/add-case-note/record-incentive-level`,
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should not permit creation of a case note with wrong type', async () => {
      mockPermissions({ [CaseNotesPermission.read_sensitive]: true })

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
        body: {
          ...caseNoteForm,
          refererUrl: 'http://referer',
        },
      } as unknown as Request

      jest.spyOn(controller.caseNotesService, 'getCaseNoteTypesForUser').mockResolvedValue([])
      const addCaseNoteSpy = jest.spyOn(controller.caseNotesService, 'addCaseNote')

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
      const getCaseNoteSpy = jest.spyOn(controller.caseNotesService, 'getCaseNote').mockResolvedValue(currentCaseNote)
      req.params.caseNoteId = 'abc123'

      await controller.displayUpdateCaseNote()(req, res, next)

      expect(getCaseNoteSpy).toHaveBeenCalledWith(
        req.middleware.clientToken,
        req.params.prisonerNumber,
        'MDI',
        req.params.caseNoteId,
      )

      expect(res.render).toHaveBeenCalledWith('pages/caseNotes/updateCaseNote', {
        refererUrl: `/prisoner/${prisonerNumber}/case-notes`,
        caseNoteText: '',
        currentCaseNote,
        maxLength: 4000 - currentLength - prisonApiAdditionalCaseNoteTextLength - res.locals.user.username.length,
        miniBannerData: {
          cellLocation: '1-1-035',
          prisonerName: 'Saunders, John',
          prisonerNumber,
          prisonerPermissions: {},
          prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
        },
        isOMICOpen: false,
        isExternal: false,
        currentLength,
        errors: undefined,
      })
    })

    it('should display update page for a sensitive case note for the appropriate permissions', async () => {
      const currentCaseNote = { ...pagedCaseNotesMock.content[0], sensitive: true }
      jest.spyOn(controller.caseNotesService, 'getCaseNote').mockResolvedValue(currentCaseNote)
      mockPermissions({ [CaseNotesPermission.edit_sensitive]: true })

      await controller.displayUpdateCaseNote()(req, res, next)

      expect(res.render).toHaveBeenCalled()
    })

    it('should not display update page for a sensitive case note when user is not permitted', async () => {
      res.locals.user.userRoles = []
      const currentCaseNote = { ...pagedCaseNotesMock.content[0], sensitive: true }

      jest.spyOn(controller.caseNotesService, 'getCaseNote').mockResolvedValue(currentCaseNote)

      await controller.displayUpdateCaseNote()(req, res, next)

      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Handle update case note POST', () => {
    it('should update case note', async () => {
      const text = 'Note text'
      const caseNoteId = 'abc123'

      req = {
        ...req,
        params: {
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
          caseNoteId,
        },
        body: {
          text,
          refererUrl: 'http://referer',
        },
      } as unknown as Request
      const updateCaseNoteSpy = jest
        .spyOn(controller.caseNotesService, 'addCaseNoteAmendment')
        .mockResolvedValue(pagedCaseNotesMock.content[0])

      jest.spyOn(controller.caseNotesService, 'getCaseNote').mockResolvedValue(pagedCaseNotesMock.content[0])

      await controller.postUpdate()(req, res, next)

      expect(updateCaseNoteSpy).toHaveBeenCalledWith(
        req.middleware.clientToken,
        PrisonerMockDataA.prisonerNumber,
        'MDI',
        caseNoteId,
        text,
      )
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/case-notes`)
    })

    it('should permit update of a sensitive case note for the appropriate permissions', async () => {
      mockPermissions({ [CaseNotesPermission.edit_sensitive]: true })
      const currentCaseNote = { ...pagedCaseNotesMock.content[0], sensitive: true }
      const reqWithBody = {
        ...req,
        body: {
          text: 'Note text',
          refererUrl: 'http://referer',
        },
      } as Request

      const updateCaseNoteSpy = jest.spyOn(controller.caseNotesService, 'addCaseNoteAmendment')
      jest.spyOn(controller.caseNotesService, 'getCaseNote').mockResolvedValue(currentCaseNote)

      await controller.postUpdate()(reqWithBody, res, next)

      expect(updateCaseNoteSpy).toHaveBeenCalled()
    })

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
          refererUrl: 'http://referer',
        },
      } as unknown as Request

      const updateCaseNoteSpy = jest.spyOn(controller.caseNotesService, 'addCaseNoteAmendment')
      jest.spyOn(controller.caseNotesService, 'getCaseNote').mockResolvedValue(currentCaseNote)

      await controller.postUpdate()(req, res, next)

      expect(updateCaseNoteSpy).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
})
