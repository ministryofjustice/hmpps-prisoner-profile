import { NextFunction, Request, Response } from 'express'
import AliasController from './aliasController'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { AuditService, Page, PostAction } from '../services/auditService'
import { prisonUserMock } from '../data/localMockData/user'
import AliasService, { Name } from '../services/aliasService'
import { aliasServiceMock } from '../../tests/mocks/aliasServiceMock'
import { PseudonymResponseMock } from '../data/localMockData/personIntegrationApiReferenceDataMock'
import { FlashMessageType } from '../data/enums/flashMessageType'
import ReferenceDataService from '../services/referenceData/referenceDataService'
import { ethnicityCodesMock } from '../data/localMockData/personIntegrationApi/referenceDataMocks'
import {
  getEthnicBackgroundRadioOptions,
  getEthnicGroupDescription,
  getEthnicGroupDescriptionForHeading,
  getEthnicGroupRadioOptions,
} from './utils/alias/ethnicityUtils'

describe('Alias Controller', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let aliasService: AliasService
  let referenceDataService: ReferenceDataService
  let auditService: AuditService
  let controller: AliasController

  beforeEach(() => {
    req = {
      id: '123',
      params: { prisonerNumber: 'G6123VU' },
      middleware: { clientToken: 'CLIENT_TOKEN', prisonerData: PrisonerMockDataA },
      flash: jest.fn().mockReturnValue([]),
      body: {},
    } as unknown as Request

    res = {
      locals: { user: prisonUserMock },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    next = jest.fn()

    auditService = auditServiceMock()
    aliasService = aliasServiceMock() as AliasService
    referenceDataService = {
      getActiveReferenceDataCodes: jest.fn().mockImplementation(() => Promise.resolve(ethnicityCodesMock)),
    } as unknown as ReferenceDataService

    controller = new AliasController(aliasService, referenceDataService, auditService)
  })

  describe('Change name purpose page', () => {
    it('should render the change name purpose page', async () => {
      await controller.displayChangeNamePurpose()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
        pageTitle: `Why are you changing this person’s name? - Prisoner personal details`,
        formTitle: `Why are you changing John Saunders’ name?`,
        errors: [],
        breadcrumbPrisonerName: 'Saunders, John',
        prisonerNumber: 'G6123VU',
        submitButtonText: 'Continue',
        options: [
          {
            value: 'name-wrong',
            text: 'Their current name is wrong',
            hint: { text: 'For example, if it contains a typo or is missing a middle name.' },
          },
          {
            value: 'name-changed',
            text: 'Their name has legally changed',
            hint: { text: 'For example, if they have taken their spouse’s or civil partner’s last name.' },
          },
        ],
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
      })

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditNamePurpose,
      })
    })

    it.each([
      [undefined, 'change-name'],
      ['name-wrong', 'enter-corrected-name'],
      ['name-changed', 'enter-new-name'],
    ])('for choice %s should redirect to %s page', async (purpose: string, redirect: string) => {
      req = { ...req, body: { radioField: purpose } } as unknown as Request

      await controller.submitChangeNamePurpose()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${redirect}`)

      if (!purpose) {
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { text: `Select why you’re changing John Saunders’ name`, href: '#radio' },
        ])
      } else {
        expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditNamePurpose,
          details: { purpose },
        })
      }
    })
  })

  describe('Change name (correction) page', () => {
    it('should render the change name correction page', async () => {
      await controller.displayChangeNameCorrection()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/alias/changeName', {
        pageTitle: `Enter this person’s correct name - Prisoner personal details`,
        formTitle: `Enter John Saunders’ correct name`,
        warningText: 'This will become their main name in DPS and NOMIS.',
        errors: [],
        formValues: {
          firstName: 'John',
          lastName: 'Saunders',
          middleName1: 'Middle',
          middleName2: 'Names',
        },
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
      })
    })

    it('Populates the errors from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          if (key === 'errors') return ['error']
          return []
        },
      } as any

      await controller.displayChangeNameCorrection()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
    })

    it('Populates the field value from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          return key === 'requestBody' ? [JSON.stringify({ firstName: 'first' })] : []
        },
      } as any

      await controller.displayChangeNameCorrection()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          formValues: {
            firstName: 'first',
            lastName: 'Saunders',
            middleName1: 'Middle',
            middleName2: 'Names',
          },
        }),
      )
    })

    it('Sends a page view audit event', async () => {
      await controller.displayChangeNameCorrection()(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditNameCorrection,
      })
    })

    it('submits the name change', async () => {
      const newName: Name = {
        firstName: 'first',
        middleName1: 'middleone',
        middleName2: 'middletwo',
        lastName: 'last',
      }

      req = { ...req, body: newName } as unknown as Request

      aliasService.updateWorkingName = jest.fn().mockResolvedValue({ ...PseudonymResponseMock, ...newName })

      await controller.submitChangeNameCorrection()(req, res, next)

      expect(aliasService.updateWorkingName).toHaveBeenCalledWith(
        expect.anything(),
        prisonUserMock,
        PrisonerMockDataA.prisonerNumber,
        newName,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#personal-details`,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Name updated',
        type: FlashMessageType.success,
        fieldName: 'fullName',
      })
    })

    it('Submission handles API errors', async () => {
      aliasService.updateWorkingName = async () => {
        throw new Error()
      }

      await controller.submitChangeNameCorrection()(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal/enter-corrected-name`,
      )
    })

    it('Sends a post success audit event', async () => {
      const newName: Name = {
        firstName: 'first',
        middleName1: 'middleone',
        middleName2: 'middletwo',
        lastName: 'last',
      }

      req = { ...req, body: newName } as unknown as Request

      aliasService.updateWorkingName = jest.fn().mockResolvedValue({ ...PseudonymResponseMock, ...newName })

      await controller.submitChangeNameCorrection()(req, res, next)

      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditNameCorrection,
        details: {
          fieldName: 'name',
          previous: {
            firstName: 'JOHN',
            middleName1: 'MIDDLE',
            middleName2: 'NAMES',
            lastName: 'SAUNDERS',
          },
          updated: newName,
        },
      }

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('Change name (legal name change) page', () => {
    it('should render the change name (legal name change) page', async () => {
      await controller.displayChangeNameLegal()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/alias/changeName', {
        pageTitle: `Enter this person’s new name - Prisoner personal details`,
        formTitle: `Enter John Saunders’ new name`,
        warningText:
          'This will become their main name in DPS and NOMIS. The previous name will be recorded as an alias.',
        errors: [],
        formValues: {},
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
      })
    })

    it('Populates the errors from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          if (key === 'errors') return ['error']
          return []
        },
      } as any

      await controller.displayChangeNameLegal()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
    })

    it('Populates the field value from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          return key === 'requestBody' ? [JSON.stringify({ firstName: 'first' })] : []
        },
      } as any

      await controller.displayChangeNameLegal()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ formValues: { firstName: 'first' } }),
      )
    })

    it('Sends a page view audit event', async () => {
      await controller.displayChangeNameLegal()(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditNameLegal,
      })
    })

    it('submits the name change', async () => {
      const newName: Name = {
        firstName: 'first',
        middleName1: 'middleone',
        middleName2: 'middletwo',
        lastName: 'last',
      }

      req = { ...req, body: newName } as unknown as Request

      aliasService.createNewWorkingName = jest.fn().mockResolvedValue({ ...PseudonymResponseMock, ...newName })

      await controller.submitChangeNameLegal()(req, res, next)

      expect(aliasService.createNewWorkingName).toHaveBeenCalledWith(
        expect.anything(),
        prisonUserMock,
        PrisonerMockDataA.prisonerNumber,
        newName,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#personal-details`,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Name updated',
        type: FlashMessageType.success,
        fieldName: 'fullName',
      })
    })

    it('Submission handles API errors', async () => {
      aliasService.createNewWorkingName = async () => {
        throw new Error()
      }

      await controller.submitChangeNameLegal()(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/personal/enter-new-name`)
    })

    it('Sends a post success audit event', async () => {
      const newName: Name = {
        firstName: 'first',
        middleName1: 'middleone',
        middleName2: 'middletwo',
        lastName: 'last',
      }

      req = { ...req, body: newName } as unknown as Request

      aliasService.createNewWorkingName = jest.fn().mockResolvedValue({ ...PseudonymResponseMock, ...newName })

      await controller.submitChangeNameLegal()(req, res, next)

      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditNameLegal,
        details: {
          fieldName: 'name',
          previous: {
            firstName: 'JOHN',
            middleName1: 'MIDDLE',
            middleName2: 'NAMES',
            lastName: 'SAUNDERS',
          },
          updated: newName,
        },
      }

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('Add new alias page', () => {
    it('should render the add new alias page', async () => {
      await controller.displayAddNewAlias()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/alias/addNewAlias', {
        pageTitle: `Enter alias details - Prisoner personal details`,
        formTitle: `Enter alias details`,
        errors: [],
        formValues: {
          'dateOfBirth-day': PseudonymResponseMock.dateOfBirth.split('-')[2],
          'dateOfBirth-month': PseudonymResponseMock.dateOfBirth.split('-')[1],
          'dateOfBirth-year': PseudonymResponseMock.dateOfBirth.split('-')[0],
          sex: PseudonymResponseMock.sex.code,
        },
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
      })
    })

    it('Populates the errors from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          if (key === 'errors') return ['error']
          return []
        },
      } as any

      await controller.displayAddNewAlias()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
    })

    it('Populates the field value from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          return key === 'requestBody' ? [JSON.stringify({ firstName: 'first' })] : []
        },
      } as any

      await controller.displayAddNewAlias()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ formValues: { firstName: 'first' } }),
      )
    })

    it('Sends a page view audit event', async () => {
      await controller.displayAddNewAlias()(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.AddNewAlias,
      })
    })

    it('submits the new alias request', async () => {
      req = {
        ...req,
        body: {
          firstName: 'first',
          middleName1: 'middleone',
          middleName2: 'middletwo',
          lastName: 'last',
          'dateOfBirth-day': '01',
          'dateOfBirth-month': '02',
          'dateOfBirth-year': '1990',
          sex: 'M',
        },
      } as unknown as Request

      aliasService.addNewAlias = jest.fn().mockResolvedValue(PseudonymResponseMock)

      await controller.submitAddNewAlias()(req, res, next)

      expect(aliasService.addNewAlias).toHaveBeenCalledWith(
        expect.anything(),
        prisonUserMock,
        PrisonerMockDataA.prisonerNumber,
        {
          firstName: 'first',
          middleName1: 'middleone',
          middleName2: 'middletwo',
          lastName: 'last',
          dateOfBirth: '1990-02-01',
          sex: 'M',
          isWorkingName: false,
        },
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#personal-details`,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Alias added',
        type: FlashMessageType.success,
        fieldName: 'aliases',
      })
    })

    it('Submission handles API errors', async () => {
      aliasService.addNewAlias = async () => {
        throw new Error()
      }

      await controller.submitAddNewAlias()(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal/enter-alias-details`,
      )
    })

    it('Sends a post success audit event', async () => {
      req = {
        ...req,
        body: {
          firstName: 'first',
          middleName1: 'middleone',
          middleName2: 'middletwo',
          lastName: 'last',
          'dateOfBirth-day': '01',
          'dateOfBirth-month': '02',
          'dateOfBirth-year': '1990',
          sex: 'M',
        },
      } as unknown as Request

      aliasService.addNewAlias = jest.fn().mockResolvedValue(PseudonymResponseMock)

      await controller.submitAddNewAlias()(req, res, next)

      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        correlationId: req.id,
        action: PostAction.AddNewAlias,
        details: PseudonymResponseMock,
      }

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('Change date of birth', () => {
    it('should render the change date of birth page', async () => {
      await controller.displayChangeDateOfBirth()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/alias/changeDateOfBirth', {
        pageTitle: `Date of birth - Prisoner personal details`,
        warningText: 'This will become their date of birth in DPS and NOMIS.',
        errors: [],
        formValues: {
          'dateOfBirth-day': PseudonymResponseMock.dateOfBirth.split('-')[2],
          'dateOfBirth-month': PseudonymResponseMock.dateOfBirth.split('-')[1],
          'dateOfBirth-year': PseudonymResponseMock.dateOfBirth.split('-')[0],
        },
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
      })
    })

    it('Populates the errors from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          if (key === 'errors') return ['error']
          return []
        },
      } as any

      await controller.displayChangeDateOfBirth()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
    })

    it('Populates the field value from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          return key === 'requestBody' ? [JSON.stringify({ 'dateOfBirth-day': '01' })] : []
        },
      } as any

      await controller.displayChangeDateOfBirth()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ formValues: { 'dateOfBirth-day': '01' } }),
      )
    })

    it('Sends a page view audit event', async () => {
      await controller.displayChangeDateOfBirth()(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditDateOfBirth,
      })
    })

    it('submits the date of birth change', async () => {
      req = {
        ...req,
        body: {
          'dateOfBirth-day': '01',
          'dateOfBirth-month': '02',
          'dateOfBirth-year': '1999',
        },
      } as unknown as Request

      await controller.submitChangeDateOfBirth()(req, res, next)

      expect(aliasService.updateDateOfBirth).toHaveBeenCalledWith(
        expect.anything(),
        prisonUserMock,
        PrisonerMockDataA.prisonerNumber,
        '1999-02-01',
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#personal-details`,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Date of birth updated',
        type: FlashMessageType.success,
        fieldName: 'dateOfBirth',
      })
    })

    it('Submission handles API errors', async () => {
      aliasService.updateDateOfBirth = async () => {
        throw new Error()
      }

      await controller.submitChangeDateOfBirth()(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/personal/date-of-birth`)
    })

    it('Sends a post success audit event', async () => {
      req = {
        ...req,
        body: {
          'dateOfBirth-day': '01',
          'dateOfBirth-month': '02',
          'dateOfBirth-year': '1999',
        },
      } as unknown as Request

      aliasService.updateDateOfBirth = jest.fn().mockResolvedValue({
        ...PseudonymResponseMock,
        dateOfBirth: '1999-02-01',
      })

      await controller.submitChangeDateOfBirth()(req, res, next)

      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditDateOfBirth,
        details: {
          fieldName: 'dateOfBirth',
          previous: '1990-10-12',
          updated: '1999-02-01',
        },
      }

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('Change ethnic group', () => {
    it('should render the change ethnic group page', async () => {
      await controller.displayChangeEthnicGroup()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
        pageTitle: `Ethnic group - Prisoner personal details`,
        formTitle: `What is John Saunders’ ethnic group?`,
        hintText:
          "Choose the group which best describes this person’s ethnic group. You'll need to select a more detailed ethnic group on the next page.",
        breadcrumbPrisonerName: 'Saunders, John',
        prisonerNumber: 'G6123VU',
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
        // This is tested separately in `ethnicityUtils.test.ts`:
        options: getEthnicGroupRadioOptions(ethnicityCodesMock, 'W1'),
        submitButtonText: 'Continue',
        errors: [],
      })

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditEthnicGroup,
      })
    })

    it.each([
      [undefined, 'personal#personal-details'],
      ['white', 'personal/white'],
      ['mixed', 'personal/mixed'],
      ['asian', 'personal/asian'],
      ['black', 'personal/black'],
      ['other', 'personal/other'],
      ['NS', 'personal#personal-details'],
    ])('for choice %s should redirect to %s page', async (ethnicGroup: string, redirect: string) => {
      req = { ...req, body: { radioField: ethnicGroup } } as unknown as Request

      await controller.submitChangeEthnicGroup()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/${redirect}`)

      if (ethnicGroup) {
        expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
          user: prisonUserMock,
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditEthnicGroup,
          details: { ethnicGroup },
        })
      }
    })

    it(`Saves ethnicity as 'They prefer not to say'`, async () => {
      req = { ...req, body: { radioField: 'NS' } } as unknown as Request
      aliasService.updateEthnicity = jest.fn().mockResolvedValue({
        ...PseudonymResponseMock,
        ethnicity: { code: 'NS' },
      })

      await controller.submitChangeEthnicGroup()(req, res, next)

      expect(aliasService.updateEthnicity).toHaveBeenCalledWith(
        expect.anything(),
        prisonUserMock,
        PrisonerMockDataA.prisonerNumber,
        'NS',
      )
      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#personal-details`,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Ethnic group updated',
        type: FlashMessageType.success,
        fieldName: 'ethnicity',
      })

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditEthnicBackground,
        details: {
          fieldName: 'ethnicity',
          previous: 'W1',
          updated: 'NS',
        },
      })
    })
  })

  describe.each([
    ['white', 'W2'],
    ['mixed', 'M2'],
    ['asian', 'A2'],
    ['black', 'B2'],
    ['other', 'O2'],
  ])('Change ethnic background for group: %s', (ethnicGroup: string, ethnicityCodeSubmitted: string) => {
    const description = getEthnicGroupDescription(ethnicGroup)
    const headingDescription = getEthnicGroupDescriptionForHeading(ethnicGroup)

    beforeEach(() => {
      req.params.group = ethnicGroup
    })

    it('should render the change ethnic background page', async () => {
      await controller.displayChangeEthnicBackground()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
        pageTitle: `${description} - Prisoner personal details`,
        backLinkUrl: '/prisoner/G6123VU/personal/ethnic-group',
        formTitle: `Which of the following best describes John Saunders’ ${headingDescription} background?`,
        breadcrumbPrisonerName: 'Saunders, John',
        prisonerNumber: 'G6123VU',
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
        },
        // This is tested separately in `ethnicityUtils.test.ts`:
        options: getEthnicBackgroundRadioOptions(ethnicGroup, ethnicityCodesMock, 'W1'),
        errors: [],
      })
    })

    it('Populates the errors from the flash', async () => {
      req = {
        ...req,
        flash: (key: string): any => {
          if (key === 'errors') return ['error']
          return []
        },
      } as any

      await controller.displayChangeEthnicBackground()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
    })

    it('Sends a page view audit event', async () => {
      await controller.displayChangeEthnicBackground()(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditEthnicBackground,
      })
    })

    it('submits the ethnicity change', async () => {
      req = { ...req, body: { radioField: ethnicityCodeSubmitted } } as unknown as Request

      await controller.submitChangeEthnicBackground()(req, res, next)

      expect(aliasService.updateEthnicity).toHaveBeenCalledWith(
        expect.anything(),
        prisonUserMock,
        PrisonerMockDataA.prisonerNumber,
        ethnicityCodeSubmitted,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/personal#personal-details`,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Ethnic group updated',
        type: FlashMessageType.success,
        fieldName: 'ethnicity',
      })
    })

    it('Submission handles API errors', async () => {
      req = { ...req, body: { radioField: ethnicityCodeSubmitted } } as unknown as Request

      aliasService.updateEthnicity = async () => {
        throw new Error()
      }

      await controller.submitChangeEthnicBackground()(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/personal/${ethnicGroup}`)
    })

    it('Sends a post success audit event', async () => {
      req = { ...req, body: { radioField: ethnicityCodeSubmitted } } as unknown as Request

      aliasService.updateEthnicity = jest.fn().mockResolvedValue({
        ...PseudonymResponseMock,
        ethnicity: { code: ethnicityCodeSubmitted },
      })

      await controller.submitChangeEthnicBackground()(req, res, next)

      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditEthnicBackground,
        details: {
          fieldName: 'ethnicity',
          previous: 'W1',
          updated: ethnicityCodeSubmitted,
        },
      }

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })
})
