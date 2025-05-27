import { Request, Response } from 'express'
import NextOfKinService from '../services/nextOfKinService'
import { AuditService, Page, PostAction } from '../services/auditService'
import NextOfKinController, { PersonalRelationshipsContactForm } from './nextOfKinController'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { PersonalRelationshipsReferenceDataDomain } from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import {
  OfficialRelationshipsReferenceCodesMock,
  SocialRelationshipsReferenceCodesMock,
} from '../data/localMockData/personalRelationshipsApiMock'

describe('NextOfKinController', () => {
  let nextOfKinService: NextOfKinService
  let auditService: AuditService
  let controller: NextOfKinController
  let req: Request
  let res: Response
  let next: () => void
  const prisonerNumber = 'A1234BC'
  const clientToken = 'CLIENT_TOKEN'

  beforeEach(() => {
    nextOfKinService = {
      getReferenceData: jest.fn().mockResolvedValue({
        Title: [],
        OfficialRelationship: OfficialRelationshipsReferenceCodesMock,
        SocialRelationship: SocialRelationshipsReferenceCodesMock,
        City: [],
      }),
      createContact: jest.fn().mockResolvedValue(null),
    } as unknown as NextOfKinService

    auditService = auditServiceMock()

    controller = new NextOfKinController(nextOfKinService, auditService)

    req = {
      middleware: {
        prisonerData: {
          ...PrisonerMockDataA,
          prisonerNumber,
        },
        clientToken,
      },
      flash: jest.fn(),
      body: {},
      params: { prisonerNumber },
      id: 'request-id',
    } as Partial<Request> as Request

    res = {
      locals: {
        user: {
          username: 'USER1',
          staffId: 123,
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('displayNextOfKinEmergencyContact', () => {
    it('should render the next of kin and emergency contacts page with data from flash', async () => {
      const requestBodyFlash: Partial<PersonalRelationshipsContactForm> = {
        firstName: 'John',
        lastName: 'Doe',
      }

      req.flash = jest.fn().mockImplementation(key => {
        if (key === 'requestBody') return [JSON.stringify(requestBodyFlash)]
        return []
      })

      const handler = controller.displayNextOfKinEmergencyContact()
      await handler(req, res, next)

      expect(nextOfKinService.getReferenceData).toHaveBeenCalledWith(clientToken, [
        PersonalRelationshipsReferenceDataDomain.Title,
        PersonalRelationshipsReferenceDataDomain.OfficialRelationship,
        PersonalRelationshipsReferenceDataDomain.SocialRelationship,
        PersonalRelationshipsReferenceDataDomain.City,
      ])

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        prisonId: 'MDI',
        correlationId: req.id,
        page: Page.EditNextOfKin,
      })

      expect(res.render).toHaveBeenCalledWith('pages/nextOfKin/nextOfKinEmergencyContacts', {
        pageTitle: 'Next of kin and emergency contacts - Prisoner personal details',
        title: 'Add a next of kin or emergency contact for John Saunders',
        formValues: requestBodyFlash,
        errors: [],
        titleOptions: expect.arrayContaining([{ value: '', text: 'Select title' }]),
        titlePrisonerName: 'John Saunders',
        relationshipOptions: expect.arrayContaining([{ value: 'S_SIS', text: 'Sister', selected: false }]),
        cityOptions: expect.arrayContaining([{ value: '', text: '' }]),
        miniBannerData: {
          cellLocation: '1-1-035',
          prisonerName: 'Saunders, John',
          prisonerNumber: 'A1234BC',
        },
      })
    })

    it('should render the page with default form values if there is no flash data', async () => {
      req.flash = jest.fn().mockImplementation(() => [])

      const handler = controller.displayNextOfKinEmergencyContact()
      await handler(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/nextOfKin/nextOfKinEmergencyContacts', {
        pageTitle: 'Next of kin and emergency contacts - Prisoner personal details',
        title: 'Add a next of kin or emergency contact for John Saunders',
        formValues: {},
        errors: [],
        titleOptions: expect.arrayContaining([{ value: '', text: 'Select title' }]),
        titlePrisonerName: 'John Saunders',
        relationshipOptions: expect.arrayContaining([{ value: 'S_SIS', text: 'Sister', selected: false }]),
        cityOptions: expect.arrayContaining([{ value: '', text: '' }]),
        miniBannerData: {
          cellLocation: '1-1-035',
          prisonerName: 'Saunders, John',
          prisonerNumber: 'A1234BC',
        },
      })
    })
  })

  describe('submitNextOfKinEmergencyContact', () => {
    it('should handle successful form submission and redirect to the success page', async () => {
      const formBody = {
        firstName: 'John',
        lastName: 'Doe',
        relationshipTypeId: 'S_SIS',
        contactType: 'nextOfKin',
        noFixedAddress: false,
      }

      req.body = formBody

      const handler = controller.submitNextOfKinEmergencyContact()
      await handler(req, res, next)

      expect(nextOfKinService.createContact).toHaveBeenCalledWith(
        clientToken,
        res.locals.user,
        controller['mapFormToRequest'](formBody, req.params.prisonerNumber, res.locals.user.username),
      )
      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        fieldName: 'next-of-kin',
        type: 'success',
        text: 'Next of kin and emergency contacts added',
      })

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditNextOfKin,
        details: { formValues: req.body },
      })

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#next-of-kin`)
    })

    it('should handle validation errors and re-render the form with error messages', async () => {
      req.body = {
        contactType: 'nextOfKin',
        firstName: '',
        lastName: 'Doe',
        relationshipTypeId: '',
      }
      req.errors = [
        { text: 'First name is required', href: '#firstName' },
        { text: 'Relationship type is required', href: '#relationshipTypeId' },
      ]

      const handler = controller.submitNextOfKinEmergencyContact()
      await handler(req, res, next)

      // Ensure the service was not called
      expect(nextOfKinService.createContact).not.toHaveBeenCalled()

      // Ensure audit service is not called in case of validation errors
      expect(auditService.sendEvent).not.toHaveBeenCalled()

      // Ensure flash contains validation errors
      expect(req.flash).toHaveBeenCalledWith('errors', req.errors)

      // Ensure the user is redirected back to the form
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/next-of-kin-emergency-contacts`)
    })

    it('should handle unexpected errors and throw them to the global error handler', async () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        relationshipTypeId: 'S_SIS',
        contactType: 'nextOfKin',
        noFixedAddress: false,
      }

      const error = { status: 400, message: 'Bad request' }
      nextOfKinService.createContact = jest.fn().mockRejectedValue(error)

      const errors = [{ text: error.message }]

      const handler = controller.submitNextOfKinEmergencyContact()
      await handler(req, res, next)

      // Ensure the service method was called
      expect(nextOfKinService.createContact).toHaveBeenCalled()

      // Ensure audit service is not called in case of validation errors
      expect(auditService.sendEvent).not.toHaveBeenCalled()

      // Ensure flash contains validation errors
      expect(req.flash).toHaveBeenCalledWith('errors', errors)

      // Ensure the user is redirected back to the form
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/next-of-kin-emergency-contacts`)
    })
  })
})
