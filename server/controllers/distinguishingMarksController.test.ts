import { Request, Response } from 'express'
import DistinguishingMarksController from './distinguishingMarksController'
import DistinguishingMarksService from '../services/distinguishingMarksService'
import { distinguishingMarkMock, leftLegMarkMock } from '../data/localMockData/distinguishingMarksMock'
import { bodyPartMap, markTypeSelections } from './interfaces/distinguishingMarks/selectionTypes'
import { getBodyPartDescription } from '../views/dataUtils/groupDistinguishingMarksForView'
import { AuditService, Page, PostAction } from '../services/auditService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonUserMock } from '../data/localMockData/user'
import { FlashMessageType } from '../data/enums/flashMessageType'

const getResLocals = () => ({
  user: prisonUserMock,
})

describe('Distinguishing Marks Controller', () => {
  let req: any
  let res: any
  let controller: DistinguishingMarksController
  let distinguishingMarksService: DistinguishingMarksService
  let auditService: AuditService

  beforeEach(() => {
    req = {
      middleware: {
        clientToken: 'token',
        prisonerData: PrisonerMockDataA,
      },
      flash: jest.fn(),
    }
    res = {
      locals: getResLocals(),
      render: jest.fn(),
      redirect: jest.fn(),
    }
    distinguishingMarksService = new DistinguishingMarksService(null)
    auditService = auditServiceMock() as AuditService
    controller = new DistinguishingMarksController(distinguishingMarksService, auditService)
  })

  describe('newDistinguishingMark', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = { ...req, params: { prisonerNumber: 'A12345', markType }, query: {} } as Request
      await controller.newDistinguishingMark(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMark', {
        markType,
        selected: undefined,
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'invalidType' },
        query: {},
      } as Request
      await controller.newDistinguishingMark(typeReq, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })

    it.each(Object.keys(bodyPartMap))('should add a valid selection (%s)', async bodyPart => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        query: { selected: bodyPart },
      } as Request
      await controller.newDistinguishingMark(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMark', {
        markType: 'tattoo',
        selected: bodyPart,
        verifiedSelection: bodyPartMap[bodyPart],
      })
    })

    it('ignore the selection if invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        query: { selected: 'invalidSelection' },
      } as Request
      await controller.newDistinguishingMark(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMark', {
        markType: 'tattoo',
        selected: 'invalidSelection',
        verifiedSelection: undefined,
      })
    })

    it('sends a page view audit event', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        query: {},
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'G6123VU',
        prisonId: 'MDI',
        correlationId: req.id,
        page: Page.AddDistinguishingMark,
      }

      await controller.newDistinguishingMark(typeReq, res)

      expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('addDistinguishingMark', () => {
    it.each(Object.keys(bodyPartMap))(
      'should add a new distinguishing mark with valid bodyPart (%s)',
      async bodyPart => {
        const submissionReq = {
          ...req,
          params: { prisonerNumber: 'A12345', markType: 'tattoo' },
          body: { bodyPart },
          flash: jest.fn(),
        } as Request

        jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

        await controller.postNewDistinguishingMark(submissionReq, res)

        expect(distinguishingMarksService.postNewDistinguishingMark).toHaveBeenCalledWith(
          'token',
          'A12345',
          'tattoo',
          bodyPartMap[bodyPart],
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/A12345/personal#marks`)
      },
    )

    it.each(markTypeSelections)('should add a new distinguishing mark with valid mark type (%s)', async markType => {
      const submissionReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType },
        body: { bodyPart: 'left-leg' },
        flash: jest.fn(),
      } as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMark(submissionReq, res)

      expect(distinguishingMarksService.postNewDistinguishingMark).toHaveBeenCalledWith(
        'token',
        'A12345',
        markType,
        'leftLeg',
      )
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/A12345/personal#marks`)
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoos' },
        body: { bodyPart: 'somethingInvalid' },
      } as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMark(typeReq, res)
      expect(distinguishingMarksService.postNewDistinguishingMark).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })

    it('Sends a post success audit event', async () => {
      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        body: { bodyPart: 'left-leg' },
        flash: jest.fn(),
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'A12345',
        correlationId: req.id,
        action: PostAction.AddDistinguishingMark,
        details: { markId: 1 },
      }

      await controller.postNewDistinguishingMark(typeReq, res)

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('newDistinguishingMarkWithDetail', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType, bodyPart: 'left-leg' },
        query: {},
      } as Request
      await controller.newDistinguishingMarkWithDetail(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMarkDetail', {
        markType,
        bodyPart: 'leftLeg',
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async bodyPart => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', bodyPart },
        query: {},
      } as Request
      await controller.newDistinguishingMarkWithDetail(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMarkDetail', {
        markType: 'tattoo',
        bodyPart: bodyPartMap[bodyPart],
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'left-leg' },
        query: {},
      } as Request
      await controller.newDistinguishingMarkWithDetail(typeReq, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })

    it('redirects back if the body part is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', bodyPart: 'invalidPart' },
        query: {},
      } as Request
      await controller.newDistinguishingMarkWithDetail(typeReq, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('postNewDistinguishingMarkWithDetail', () => {
    it('should add a new distinguishing mark with valid bodyPart and description', async () => {
      const partReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        body: {
          specificBodyPart: 'lowerLeftArm',
          'description-lowerLeftArm': 'A tattoo',
        },
        query: {},
        flash: jest.fn(),
      } as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMarkWithDetail(partReq, res)

      expect(distinguishingMarksService.postNewDistinguishingMark).toHaveBeenCalledWith(
        'token',
        'A12345',
        'tattoo',
        'lowerLeftArm',
        'A tattoo',
        undefined,
      )
    })

    it('should use first file for body part', async () => {
      const partReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        body: {
          specificBodyPart: 'lowerLeftArm',
          'description-lowerLeftArm': 'A tattoo',
        },
        file: { originalname: 'file.jpg' },
        query: {},
        flash: jest.fn(),
      } as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMarkWithDetail(partReq, res)

      expect(distinguishingMarksService.postNewDistinguishingMark).toHaveBeenCalledWith(
        'token',
        'A12345',
        'tattoo',
        'lowerLeftArm',
        'A tattoo',
        { originalname: 'file.jpg' },
      )
    })

    it('Sends a post success audit event', async () => {
      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      const partReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        body: {
          specificBodyPart: 'lowerLeftArm',
          'description-lowerLeftArm': 'A tattoo',
        },
        file: { originalname: 'file.jpg' },
        query: {},
        flash: jest.fn(),
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'A12345',
        correlationId: req.id,
        action: PostAction.AddDistinguishingMark,
        details: { markId: 1, photoId: 100 },
      }

      await controller.postNewDistinguishingMarkWithDetail(partReq, res)

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('changeDistinguishingMark', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark details', async markType => {
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType, markId: distinguishingMarkMock.id },
        query: {},
      } as Request

      await controller.changeDistinguishingMark(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeDistinguishingMark', {
        prisonerNumber: 'A12345',
        markType,
        mark: distinguishingMarkMock,
        updated: false,
      })
    })

    it('should flag to the template when an update has happened', async () => {
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: distinguishingMarkMock.id },
        query: { updated: 'true' },
      } as Request

      await controller.changeDistinguishingMark(typeReq, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/distinguishingMarks/changeDistinguishingMark',
        expect.objectContaining({
          updated: true,
        }),
      )
    })

    it('sends a page view audit event', async () => {
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: distinguishingMarkMock.id },
        query: {},
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'G6123VU',
        prisonId: 'MDI',
        correlationId: req.id,
        page: Page.EditDistinguishingMark,
      }

      await controller.changeDistinguishingMark(typeReq, res)

      expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('returnToPrisonerProfileAfterUpdate', () => {
    it.each([
      ['tattoo', 'Tattoos updated'],
      ['scar', 'Scars updated'],
      ['mark', 'Other marks updated'],
    ])('creates a flashMessage and redirects to the profile for type: %s', async (markType, flashMessage) => {
      const typeReq = { ...req, params: { prisonerNumber: 'A12345', markType } } as Request

      await controller.returnToPrisonerProfileAfterUpdate(typeReq, res)

      expect(typeReq.flash).toHaveBeenCalledWith('flashMessage', {
        text: flashMessage,
        type: FlashMessageType.success,
        fieldName: `distinguishing-marks-${markType}`,
      })

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('changeBodyPart', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        ...req,
        params: {
          prisonerNumber: 'A12345',
          markType,
          markId: '100',
        },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(leftLegMarkMock)

      await controller.changeBodyPart(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeBodyPart', {
        markType,
        cancelUrl: `/prisoner/A12345/personal/${markType}/100`,
        selected: 'left-leg',
        verifiedSelection: 'leftLeg',
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async bodyPart => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        query: { selected: bodyPart },
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeBodyPart(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeBodyPart', {
        markType: 'tattoo',
        cancelUrl: '/prisoner/A12345/personal/tattoo/100',
        selected: bodyPart,
        verifiedSelection: bodyPartMap[bodyPart],
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeBodyPart(typeReq, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('updateBodyPart', () => {
    it.each(Object.keys(bodyPartMap).filter(part => !['neck', 'back'].includes(part)))(
      'should update distinguishing mark with valid bodyPart and available locations (%s)',
      async bodyPart => {
        const submissionReq = {
          ...req,
          params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
          body: { bodyPart },
        } as Request

        jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
        jest
          .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
          .mockResolvedValue(distinguishingMarkMock)

        await controller.updateBodyPart(submissionReq, res)

        expect(distinguishingMarksService.updateDistinguishingMarkLocation).toHaveBeenCalledWith(
          'token',
          'A12345',
          '100',
          distinguishingMarkMock,
          'tattoo',
          bodyPartMap[bodyPart],
        )
        expect(res.redirect).toHaveBeenCalledWith(
          `/prisoner/A12345/personal/tattoo/100/location?bodyPart=${bodyPart}&bodyPartChanged=true&referer=body-part`,
        )
      },
    )

    it.each(Object.keys(bodyPartMap).filter(part => ['neck', 'back'].includes(part)))(
      'should update distinguishing mark with valid bodyPart with no available locations (%s)',
      async bodyPart => {
        const submissionReq = {
          ...req,
          params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
          body: { bodyPart },
        } as Request

        jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
        jest
          .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
          .mockResolvedValue(distinguishingMarkMock)

        await controller.updateBodyPart(submissionReq, res)

        expect(distinguishingMarksService.updateDistinguishingMarkLocation).toHaveBeenCalledWith(
          'token',
          'A12345',
          '100',
          distinguishingMarkMock,
          'tattoo',
          bodyPartMap[bodyPart],
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/A12345/personal/tattoo/100`)
      },
    )

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoos' },
        body: { bodyPart: 'somethingInvalid' },
      } as Request

      jest
        .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
        .mockResolvedValue(distinguishingMarkMock)

      await controller.updateBodyPart(typeReq, res)
      expect(distinguishingMarksService.updateDistinguishingMarkLocation).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })

    it('Sends a post success audit event', async () => {
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      jest
        .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
        .mockResolvedValue(distinguishingMarkMock)
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: { bodyPart: 'left-leg' },
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'A12345',
        correlationId: req.id,
        action: PostAction.EditDistinguishingMark,
        details: { markId: '100', fieldName: 'location', previous: 'leftArm', updated: 'leftLeg' },
      }

      await controller.updateBodyPart(typeReq, res)

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('changeLocation', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        ...req,
        params: {
          prisonerNumber: 'A12345',
          markType,
          markId: '100',
        },
        query: { bodyPart: 'left-leg', referer: 'body-part' },
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(leftLegMarkMock)

      await controller.changeLocation(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeLocation', {
        markId: '100',
        markType,
        bodyPart: 'leftLeg',
        specificBodyPart: 'leftLeg',
        backLinkUrl: `/prisoner/A12345/personal/${markType}/100/body-part?selected=left-leg`,
        cancelUrl: `/prisoner/A12345/personal/${markType}/100`,
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async bodyPart => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        query: { bodyPart, bodyPartChanged: 'true' },
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeLocation(typeReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeLocation', {
        markId: '100',
        markType: 'tattoo',
        bodyPart: bodyPartMap[bodyPart],
        cancelUrl: `/prisoner/A12345/personal/tattoo/100`,
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeLocation(typeReq, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })

    it('redirects back if the body part is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', bodyPart: 'invalidPart' },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeLocation(typeReq, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('updateLocation', () => {
    it('should update distinguishing mark with valid location', async () => {
      const markReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: {
          specificBodyPart: 'lowerLeftArm',
        },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      jest
        .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
        .mockResolvedValue(distinguishingMarkMock)

      await controller.updateLocation(markReq, res)

      expect(distinguishingMarksService.updateDistinguishingMarkLocation).toHaveBeenCalledWith(
        'token',
        'A12345',
        '100',
        distinguishingMarkMock,
        'tattoo',
        'lowerLeftArm',
      )
    })

    it('Sends a post success audit event', async () => {
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      jest
        .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
        .mockResolvedValue(distinguishingMarkMock)
      const markReq = {
        ...req,
        params: { prisonerNumber: 'A12345', fieldName: 'location', markType: 'tattoo', markId: '100' },
        body: {
          specificBodyPart: 'lowerLeftArm',
        },
        query: {},
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'A12345',
        correlationId: req.id,
        action: PostAction.EditDistinguishingMark,
        details: { markId: '100', fieldName: 'location', previous: 'leftArm', updated: 'lowerLeftArm' },
      }

      await controller.updateLocation(markReq, res)

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('changeDescription', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        ...req,
        params: {
          prisonerNumber: 'A12345',
          markType,
          markId: '100',
        },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(leftLegMarkMock)

      await controller.changeDescription(typeReq, { ...res, locals: {} } as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeDescription', {
        markId: '100',
        markType,
        formValues: { description: 'Comment' },
        cancelUrl: `/prisoner/A12345/personal/${markType}/100`,
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeDescription(typeReq, { ...res, locals: {} } as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeDescription', {
        markId: '100',
        markType: 'tattoo',
        formValues: { description: 'Horrible arm scar' },
        cancelUrl: `/prisoner/A12345/personal/tattoo/100`,
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeDescription(typeReq, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('updateDescription', () => {
    it('should update distinguishing mark with description', async () => {
      const markReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: {
          description: 'description',
        },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      jest
        .spyOn(distinguishingMarksService, 'updateDistinguishingMarkDescription')
        .mockResolvedValue(distinguishingMarkMock)

      await controller.updateDescription(markReq, res)

      expect(distinguishingMarksService.updateDistinguishingMarkDescription).toHaveBeenCalledWith(
        'token',
        'A12345',
        '100',
        distinguishingMarkMock,
        'tattoo',
        'description',
      )
    })

    it('Sends a post success audit event', async () => {
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      jest
        .spyOn(distinguishingMarksService, 'updateDistinguishingMarkDescription')
        .mockResolvedValue(distinguishingMarkMock)
      const markReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: {
          description: 'updated description',
        },
        query: {},
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'A12345',
        correlationId: req.id,
        action: PostAction.EditDistinguishingMark,
        details: {
          markId: '100',
          fieldName: 'description',
          previous: 'Horrible arm scar',
          updated: 'updated description',
        },
      }

      await controller.updateDescription(markReq, res)

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('changePhoto', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        ...req,
        params: {
          prisonerNumber: 'A12345',
          markType,
          markId: '100',
          photoId: leftLegMarkMock.photographUuids[0].id,
        },
        query: {},
      } as Request

      global.Date.now = jest.fn(() => 12345)
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(leftLegMarkMock)

      await controller.changePhoto(typeReq, { ...res, locals: {} } as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changePhoto', {
        markId: '100',
        markType,
        photo: {
          url: `/api/distinguishing-mark-image/${leftLegMarkMock.photographUuids[0].id}?nocache=12345`,
          alt: `Image of ${leftLegMarkMock.markType.description} on ${getBodyPartDescription(leftLegMarkMock)}`,
        },
        cancelUrl: `/prisoner/A12345/personal/${markType}/100`,
        upload: false,
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async () => {
      const typeReq = {
        ...req,
        params: {
          prisonerNumber: 'A12345',
          markType: 'tattoo',
          markId: '100',
          photoId: distinguishingMarkMock.photographUuids[0].id,
        },
        query: {},
      } as Request

      global.Date.now = jest.fn(() => 12345)
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changePhoto(typeReq, { ...res, locals: {} } as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changePhoto', {
        markId: '100',
        markType: 'tattoo',
        photo: {
          url: `/api/distinguishing-mark-image/${distinguishingMarkMock.photographUuids[0].id}?nocache=12345`,
          alt: `Image of ${distinguishingMarkMock.markType.description} on ${getBodyPartDescription(distinguishingMarkMock)}`,
        },
        cancelUrl: `/prisoner/A12345/personal/tattoo/100`,
        upload: false,
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changePhoto(typeReq, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#appearance')
    })

    it('sends a page view audit event', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', bodyPart: 'left-leg' },
        query: {},
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'G6123VU',
        prisonId: 'MDI',
        correlationId: req.id,
        page: Page.EditDistinguishingMarkPhoto,
      }

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changePhoto(typeReq, res)

      expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('updatePhoto', () => {
    it('should update an existing distinguishing mark photo', async () => {
      const photoReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100', photoId: '123' },
        body: {},
        file: { originalname: 'file.jpg' },
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'updateDistinguishingMarkPhoto').mockResolvedValue(distinguishingMarkMock)

      await controller.updatePhoto(photoReq, res)

      expect(distinguishingMarksService.updateDistinguishingMarkPhoto).toHaveBeenCalledWith('token', '123', {
        originalname: 'file.jpg',
      })
    })

    it('sends a post success audit event', async () => {
      jest.spyOn(distinguishingMarksService, 'updateDistinguishingMarkPhoto').mockResolvedValue(distinguishingMarkMock)
      const photoReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100', photoId: '123' },
        body: {},
        file: { originalname: 'file.jpg' },
        query: {},
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'A12345',
        correlationId: req.id,
        action: PostAction.EditDistinguishingMarkPhoto,
        details: {
          markId: '100',
          photoId: '123',
        },
      }

      await controller.updatePhoto(photoReq, res)

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('addNewPhoto', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        ...req,
        params: {
          prisonerNumber: 'A12345',
          markType,
          markId: '100',
          photoId: leftLegMarkMock.photographUuids[0].id,
        },
        query: {},
      } as Request

      await controller.addNewPhoto(typeReq, { ...res, locals: {} } as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addPhoto', {
        markId: '100',
        markType,
        cancelUrl: `/prisoner/A12345/personal/${markType}/100`,
        upload: false,
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async () => {
      const typeReq = {
        ...req,
        params: {
          prisonerNumber: 'A12345',
          markType: 'tattoo',
          markId: '100',
          photoId: distinguishingMarkMock.photographUuids[0].id,
        },
        query: {},
      } as Request

      await controller.addNewPhoto(typeReq, { ...res, locals: {} } as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addPhoto', {
        markId: '100',
        markType: 'tattoo',
        cancelUrl: `/prisoner/A12345/personal/tattoo/100`,
        upload: false,
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        query: {},
      } as Request

      await controller.addNewPhoto(typeReq, res)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#appearance')
    })

    it('sends a page view audit event', async () => {
      const typeReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', bodyPart: 'left-leg' },
        query: {},
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'G6123VU',
        prisonId: 'MDI',
        correlationId: req.id,
        page: Page.AddDistinguishingMarkPhoto,
      }

      await controller.addNewPhoto(typeReq, res)

      expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('addPhoto', () => {
    it.each([
      [undefined, '/prisoner/A12345/personal/tattoo/100?updated=true'],
      ['returnToMarkSummary', '/prisoner/A12345/personal/tattoo/100?updated=true'],
      ['addAnotherPhoto', '/prisoner/A12345/personal/tattoo/100/photo?updated=true'],
    ])(
      'should add a new distinguishing mark photo and redirect correctly',
      async (action: string | undefined, redirectUrl: string) => {
        const photoReq = {
          ...req,
          params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
          body: { action },
          file: { originalname: 'file.jpg' },
          query: {},
        } as Request

        jest.spyOn(distinguishingMarksService, 'addDistinguishingMarkPhoto').mockResolvedValue(distinguishingMarkMock)

        await controller.addPhoto(photoReq, res)

        expect(distinguishingMarksService.addDistinguishingMarkPhoto).toHaveBeenCalledWith('token', 'A12345', '100', {
          originalname: 'file.jpg',
        })
        expect(res.redirect).toHaveBeenCalledWith(redirectUrl)
      },
    )

    it('Sends a post success audit event', async () => {
      jest.spyOn(distinguishingMarksService, 'addDistinguishingMarkPhoto').mockResolvedValue(distinguishingMarkMock)
      const photoReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '101' },
        body: {},
        file: { originalname: 'file.jpg' },
        query: {},
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'A12345',
        correlationId: req.id,
        action: PostAction.AddDistinguishingMarkPhoto,
        details: { markId: '101', photoId: 100 },
      }

      await controller.addPhoto(photoReq, res)

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })

  describe('viewAllImages', () => {
    it('should display all images for a distinguishing mark', async () => {
      const imagesReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: {},
        query: {},
      } as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.viewAllImages(imagesReq, res)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/viewAllImages', {
        prisonerName: 'John Saunders',
        prisonerNumber: 'A12345',
        mark: distinguishingMarkMock,
        markType: 'tattoo',
      })
    })

    it('sends a page view audit event', async () => {
      const imagesReq = {
        ...req,
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: {},
        query: {},
      } as Request
      const expectedAuditEvent = {
        user: prisonUserMock,
        prisonerNumber: 'G6123VU',
        prisonId: 'MDI',
        correlationId: req.id,
        page: Page.DistinguishingMarkAllPhotos,
      }
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.viewAllImages(imagesReq, res)

      expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
    })
  })
})
