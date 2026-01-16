import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import ReligionController from './religionController'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import InmateDetail from '../../../../data/interfaces/prisonApi/InmateDetail'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'

describe('ReligionController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: ReligionController
  let res: Response
  const next: NextFunction = jest.fn()

  const { prisonerNumber } = PrisonerMockDataA

  const middleware = {
    clientToken: 'token',
    prisonerData: PrisonerMockDataA,
    inmateDetail: {
      ...inmateDetailMock,
      profileInformation: [{ question: 'Religion', resultValue: 'Buddhist', type: ProfileInformationType.Religion }],
    },
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    auditService = auditServiceMock()

    controller = new ReligionController(personalPageService, auditService)
    res = {
      locals: {
        user: prisonUserMock,
        prisonerName: {
          firstLast: 'John Saunders',
          lastCommaFirst: 'Saunders, John',
          full: 'John Saunders',
        },
        prisonerNumber,
        prisonId: 999,
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('religion', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.religion().edit(req, response, next)

      it('Renders the default edit page with the correct data from the prison API, overriding option text and sorting correctly', async () => {
        const expectedOptions = [
          { text: 'Buddhist', value: 'BUDD' },
          {
            text: 'Christian – Anglican',
            value: 'COFE',
            hint: {
              text: 'Includes Church of England, Church of Ireland, Church in Wales, Church of Norway, Church of Sweden, Episcopalian, and Lutheran',
            },
          },
          { text: 'Christian – Methodist', value: 'METH' },
          {
            text: 'Christian – Orthodox',
            value: 'CHRODX',
            hint: {
              text: 'Includes Bulgarian Orthodox, Eastern Orthodox, Greek Orthodox, Romanian Orthodox, Russian Orthodox, Serbian Orthodox, and Ukrainian Orthodox',
            },
          },
          { text: 'Christian – Oriental Orthodox', value: 'OORTH' },
          {
            text: 'Christian – Other',
            value: 'CHRST',
            hint: {
              text: 'Includes Apostolic, Calvinist, Celestial Church of God, Church of Scotland, Congregational, Dutch Reform Church, Evangelical, Gospel, Nonconformist, Pentecostal, Protestant, Salvation Army, United Reformed, and Welsh Independent',
            },
          },
          { text: 'Muslim – Shia', value: 'SHIA' },
          {
            text: 'Muslim – Sunni',
            value: 'SUNI',
            hint: {
              text: 'Most Muslims in the UK are Sunni, they will often describe themselves just as Muslim',
            },
          },
          { text: 'Muslim – Other', value: 'MUSOTH' },
          { text: 'Zoroastrian', value: 'ZORO' },
          { divider: 'Or' },
          {
            text: 'Other religion, faith or belief',
            value: 'OTH',
            hint: {
              text: 'Includes Christadelphian, Unification, Unitarian and all other religions, faiths or beliefs',
            },
          },
          { text: 'No religion, faith or belief', value: 'NIL' },
          { text: 'They prefer not to say', value: 'TPRNTS' },
        ]
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/religion', {
          pageTitle: 'Religion, faith or belief - Prisoner personal details',
          formTitle: `Select John Saunders’ religion, faith or belief`,
          redirectAnchor: 'religion-faith-or-belief',
          currentReasonForChange: undefined,
          currentReasonForChangeUnknown: undefined,
          currentReasonKnown: undefined,
          currentReligion: {
            id: 'RELF_BUDD',
            code: 'BUDD',
            description: 'Buddhist',
            isActive: true,
            listSequence: 99,
          },
          errors: [],
          options: expectedOptions,
          miniBannerData: {
            cellLocation: '1-1-035',
            prisonerName: 'Saunders, John',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the religion radio buttons from the flash', async () => {
        const expectedOptions = [
          { text: 'Buddhist', value: 'BUDD' },
          {
            text: 'Christian – Anglican',
            value: 'COFE',
            hint: {
              text: 'Includes Church of England, Church of Ireland, Church in Wales, Church of Norway, Church of Sweden, Episcopalian, and Lutheran',
            },
          },
          { text: 'Christian – Methodist', value: 'METH' },
          {
            text: 'Christian – Orthodox',
            value: 'CHRODX',
            hint: {
              text: 'Includes Bulgarian Orthodox, Eastern Orthodox, Greek Orthodox, Romanian Orthodox, Russian Orthodox, Serbian Orthodox, and Ukrainian Orthodox',
            },
          },
          { text: 'Christian – Oriental Orthodox', value: 'OORTH' },
          {
            text: 'Christian – Other',
            value: 'CHRST',
            hint: {
              text: 'Includes Apostolic, Calvinist, Celestial Church of God, Church of Scotland, Congregational, Dutch Reform Church, Evangelical, Gospel, Nonconformist, Pentecostal, Protestant, Salvation Army, United Reformed, and Welsh Independent',
            },
          },
          { text: 'Muslim – Shia', value: 'SHIA' },
          {
            text: 'Muslim – Sunni',
            value: 'SUNI',
            hint: {
              text: 'Most Muslims in the UK are Sunni, they will often describe themselves just as Muslim',
            },
          },
          { text: 'Muslim – Other', value: 'MUSOTH' },
          { text: 'Zoroastrian', value: 'ZORO', checked: true },
          { divider: 'Or' },
          {
            text: 'Other religion, faith or belief',
            value: 'OTH',
            hint: {
              text: 'Includes Christadelphian, Unification, Unitarian and all other religions, faiths or beliefs',
            },
          },
          { text: 'No religion, faith or belief', value: 'NIL' },
          { text: 'They prefer not to say', value: 'TPRNTS' },
        ]

        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ religion: 'ZORO' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expectedOptions,
          }),
        )
      })

      it('Populates the reason for change radio from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ reasonKnown: 'YES' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            currentReasonKnown: 'YES',
          }),
        )
      })

      it('Populates the text areas from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody'
              ? [JSON.stringify({ reasonForChange: 'Reason 1', reasonForChangeUnknown: 'Reason 2' })]
              : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            currentReasonForChange: 'Reason 1',
            currentReasonForChangeUnknown: 'Reason 2',
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditReligion,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.religion().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          middleware,
          params: { prisonerNumber },
          body: { religion: 'ZORO', reasonKnown: 'NO' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it.each([
        { body: { religion: 'ZORO', reasonKnown: 'NO' }, updatedReligion: 'ZORO' },
        {
          body: { religion: 'ZORO', reasonKnown: 'NO', reasonForChangeUnknown: 'Not sure' },
          updatedReligion: 'ZORO',
          reason: 'Not sure',
        },
        {
          body: {
            religion: 'ZORO',
            reasonKnown: 'NO',
            reasonForChange: 'Some reason',
            reasonForChangeUnknown: 'Not sure',
          },
          updatedReligion: 'ZORO',
          reason: 'Not sure',
        },
        {
          body: { religion: 'ZORO', reasonKnown: 'YES', reasonForChange: 'Some reason' },
          updatedReligion: 'ZORO',
          reason: 'Some reason',
        },
        {
          body: {
            religion: 'ZORO',
            reasonKnown: 'YES',
            reasonForChange: 'Some reason',
            reasonForChangeUnknown: 'Not sure',
          },
          updatedReligion: 'ZORO',
          reason: 'Some reason',
        },
      ])('Prisoner with existing religion - valid request: %s', async ({ body, updatedReligion, reason }) => {
        const request = { ...validRequest, body } as Request
        await action(request, res, next)
        expect(personalPageService.updateReligion).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          updatedReligion,
          reason,
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#religion-faith-or-belief`)
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Religion, faith or belief updated',
          type: FlashMessageType.success,
          fieldName: 'religion',
        })
      })

      it.each([
        {
          body: { religion: 'ZORO' },
          updatedReligion: 'ZORO',
        },
        {
          body: { religion: 'ZORO', reasonForChange: 'Some reason' },
          updatedReligion: 'ZORO',
          reason: 'Some reason',
        },
      ])('Prisoner without existing religion - valid request: %s', async ({ body, updatedReligion, reason }) => {
        const request = {
          middleware: {
            clientToken: 'token',
            prisonerData: {
              firstName: 'First',
              lastName: 'Last',
              cellLocation: '2-3-001',
              prisonerNumber,
              prisonId: 999,
            },
            inmateDetail: {
              birthPlace: 'SHEFFIELD',
              profileInformation: [],
            } as InmateDetail,
          },
          params: { prisonerNumber },
          body,
          flash: jest.fn(),
        } as unknown as Request

        await action(request, res, next)

        expect(personalPageService.updateReligion).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          updatedReligion,
          reason,
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#religion-faith-or-belief`)
        expect(request.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Religion, faith or belief updated',
          type: FlashMessageType.success,
          fieldName: 'religion',
        })
      })

      it('Sends a post success audit event', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: { religion: 'ZORO', currentReligionCode: 'DRU', reasonKnown: 'NO' },
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: request.id,
          action: PostAction.EditReligion,
          details: {
            fieldName: 'religion',
            previous: 'DRU',
            updated: 'ZORO',
          },
        }

        await action(request, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })

      it('Does not submit a request if no religion was selected', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: {},
        } as unknown as Request

        await action(request, res, next)

        expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
        expect(personalPageService.updateReligion).not.toHaveBeenCalled()
      })

      it('Handles API errors', async () => {
        personalPageService.updateReligion = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/religion`)
      })
    })
  })
})
