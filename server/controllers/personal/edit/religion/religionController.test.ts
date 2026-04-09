import { NextFunction, Request, RequestHandler, Response } from 'express'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { AuditService, PostAction } from '../../../../services/auditService'
import PersonalPageService from '../../../../services/personalPageService'
import ReligionController from './religionController'
import { prisonUserMock } from '../../../../data/localMockData/user'
import InmateDetail from '../../../../data/interfaces/prisonApi/InmateDetail'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'

describe('ReligionController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: ReligionController
  let res: Response
  const next: NextFunction = jest.fn()

  const prisonerNumber = 'A1234BC'

  const defaultMiddleware = {
    clientToken: 'token',
    prisonerData: {
      firstName: 'First',
      lastName: 'Last',
      cellLocation: '2-3-001',
      prisonerNumber,
      prisonId: 999,
    },
    inmateDetail: {
      firstName: 'First',
      lastName: 'Last',
      birthPlace: 'SHEFFIELD',
      profileInformation: [
        { question: 'Smoker or Vaper', resultValue: 'Yes', type: ProfileInformationType.SmokerOrVaper },
        { question: 'Nationality', resultValue: 'BRIT', type: ProfileInformationType.Nationality },
        {
          question: 'Other Nationality',
          resultValue: 'Some other nationality',
          type: ProfileInformationType.OtherNationalities,
        },
        { question: 'Religion', resultValue: 'Buddhist', type: ProfileInformationType.Religion },
        {
          question: 'Sexual orientation',
          resultValue: 'Heterosexual / Straight',
          type: ProfileInformationType.SexualOrientation,
        },
      ],
    } as InmateDetail,
  }

  const defaultLocals = {
    user: prisonUserMock,
    prisonerNumber,
    prisonerName: {
      firstLast: 'First Last',
      lastCommaFirst: 'Last, First',
      full: 'First Last',
    },
    prisonId: 999,
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    auditService = auditServiceMock()

    controller = new ReligionController(personalPageService, auditService)
    res = { locals: defaultLocals, render: jest.fn(), redirect: jest.fn() } as unknown as Response
  })

  describe('religion, faith or belief', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.religion().edit(req, response, next)
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
          text: 'Christian – Oriental Orthodox',
          value: 'OORTH',
          hint: {
            text: 'Includes Coptic Orthodox, Syriac Orthodox, Armenian Apostolic, Ethiopian Orthodox Tewahedo, Eritrean Orthodox Tewahedo and Malankara Orthodox Syrian',
          },
        },
        {
          text: 'Christian – Orthodox',
          value: 'CHRODX',
          hint: {
            text: 'Includes Bulgarian Orthodox, Eastern Orthodox, Greek Orthodox, Romanian Orthodox, Russian Orthodox, Serbian Orthodox, and Ukrainian Orthodox',
          },
        },
        {
          text: 'Christian – Other',
          value: 'CHRST',
          hint: {
            text: 'Includes Apostolic, Calvinist, Celestial Church of God, Church of Scotland, Congregational, Dutch Reform Church, Evangelical, Gospel, Nonconformist, Pentecostal, Protestant, Salvation Army, United Reformed, and Welsh Independent',
          },
        },
        { text: 'Muslim', value: 'MOS' },
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
            text: 'Includes Christadelphian, Unification, Unitarian, mixed or spiritual beliefs, and all other religions, faiths or beliefs',
          },
        },
        { text: 'No religion, faith or belief', value: 'NIL' },
        { text: 'They prefer not to say', value: 'TPRNTS' },
      ]

      it('Renders the default edit page with the correct data from the prison API, overriding option text and sorting correctly', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/religion', {
          pageTitle: 'Religion, faith or belief - Prisoner personal details',
          formTitle: `Select First Last’s religion, faith or belief`,
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
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=undefined&fullSizeImage=false`,
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
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the religion radio buttons from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ religion: 'ZORO' })] : []
          },
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expectedOptions.map(option => (option.value === 'ZORO' ? { ...option, checked: true } : option)),
          }),
        )
      })

      it('Populates the reason for change radio from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ reasonKnown: 'YES' })] : []
          },
          middleware: defaultMiddleware,
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
          middleware: defaultMiddleware,
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
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.religion().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          middleware: defaultMiddleware,
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
