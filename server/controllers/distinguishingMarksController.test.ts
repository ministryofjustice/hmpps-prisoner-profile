import { Request, Response } from 'express'
import DistinguishingMarksController from './distinguishingMarksController'
import DistinguishingMarksService from '../services/distinguishingMarksService'
import { distinguishingMarkMock, leftLegMarkMock } from '../data/localMockData/distinguishingMarksMock'
import { bodyPartMap, markTypeSelections } from './interfaces/distinguishingMarks/selectionTypes'
import { getBodyPartDescription } from '../views/dataUtils/groupDistinguishingMarksForView'

describe('Distinguishing Marks Controller', () => {
  let res: Partial<Response>
  let controller: DistinguishingMarksController
  let distinguishingMarksService: DistinguishingMarksService

  beforeEach(() => {
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    }
    distinguishingMarksService = new DistinguishingMarksService(null)
    controller = new DistinguishingMarksController(distinguishingMarksService)
  })

  describe('getDistinguishingMarks', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', markType => {
      const typeReq = { params: { prisonerNumber: 'A12345', markType }, query: {} } as undefined as Request
      controller.newDistinguishingMark(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMark', {
        markType,
        selected: undefined,
      })
    })

    it('redirects back if the mark type is invalid', () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'invalidType' },
        query: {},
      } as undefined as Request
      controller.newDistinguishingMark(typeReq, res as Response)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })

    it.each(Object.keys(bodyPartMap))('should add a valid selection (%s)', bodyPart => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        query: { selected: bodyPart },
      } as undefined as Request
      controller.newDistinguishingMark(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMark', {
        markType: 'tattoo',
        selected: bodyPart,
        verifiedSelection: bodyPartMap[bodyPart],
      })
    })

    it('ignore the selection if invalid', () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        query: { selected: 'invalidSelection' },
      } as undefined as Request
      controller.newDistinguishingMark(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMark', {
        markType: 'tattoo',
        selected: 'invalidSelection',
        verifiedSelection: undefined,
      })
    })
  })

  describe('addDistinguishingMark', () => {
    it.each(Object.keys(bodyPartMap))(
      'should add a new distinguishing mark with valid bodyPart (%s)',
      async bodyPart => {
        const submissionReq = {
          params: { prisonerNumber: 'A12345', markType: 'tattoo' },
          body: { bodyPart },
          middleware: { clientToken: 'token' },
          flash: jest.fn(),
        } as undefined as Request

        jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

        await controller.postNewDistinguishingMark(submissionReq as Request, res as Response)

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
        params: { prisonerNumber: 'A12345', markType },
        body: { bodyPart: 'left-leg' },
        middleware: { clientToken: 'token' },
        flash: jest.fn(),
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMark(submissionReq as Request, res as Response)

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
        params: { prisonerNumber: 'A12345', markType: 'tattoos' },
        body: { bodyPart: 'somethingInvalid' },
        middleware: { clientToken: 'token' },
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMark(typeReq as Request, res as Response)
      expect(distinguishingMarksService.postNewDistinguishingMark).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('newDistinguishingMarkWithDetail', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', markType => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType, bodyPart: 'left-leg' },
        query: {},
      } as undefined as Request
      controller.newDistinguishingMarkWithDetail(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMarkDetail', {
        markType,
        bodyPart: 'leftLeg',
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', bodyPart => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', bodyPart },
        query: {},
      } as undefined as Request
      controller.newDistinguishingMarkWithDetail(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMarkDetail', {
        markType: 'tattoo',
        bodyPart: bodyPartMap[bodyPart],
      })
    })

    it('redirects back if the mark type is invalid', () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        query: {},
      } as undefined as Request
      controller.newDistinguishingMarkWithDetail(typeReq, res as Response)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })

    it('redirects back if the body part is invalid', () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', bodyPart: 'invalidPart' },
        query: {},
      } as undefined as Request
      controller.newDistinguishingMarkWithDetail(typeReq, res as Response)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('postNewDistinguishingMarkWithDetail', () => {
    it('should add a new distinguishing mark with valid bodyPart and description', async () => {
      const req = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        body: {
          specificBodyPart: 'lowerLeftArm',
          'description-lowerLeftArm': 'A tattoo',
        },
        files: {},
        middleware: { clientToken: 'token' },
        query: {},
        flash: jest.fn(),
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMarkWithDetail(req, res as Response)

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
      const req = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        body: {
          specificBodyPart: 'lowerLeftArm',
          'description-lowerLeftArm': 'A tattoo',
        },
        files: { 'file-lowerLeftArm': [{ originalname: 'file.jpg' }] },
        middleware: { clientToken: 'token' },
        query: {},
        flash: jest.fn(),
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMarkWithDetail(req, res as Response)

      expect(distinguishingMarksService.postNewDistinguishingMark).toHaveBeenCalledWith(
        'token',
        'A12345',
        'tattoo',
        'lowerLeftArm',
        'A tattoo',
        { originalname: 'file.jpg' },
      )
    })
  })

  describe('changeDistinguishingMark', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark details', async markType => {
      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType, markId: distinguishingMarkMock.id },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      await controller.changeDistinguishingMark(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeDistinguishingMark', {
        prisonerNumber: 'A12345',
        markType,
        mark: distinguishingMarkMock,
      })
    })
  })

  describe('changeBodyPart', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        params: {
          prisonerNumber: 'A12345',
          markType,
          markId: '100',
        },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(leftLegMarkMock)

      await controller.changeBodyPart(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeBodyPart', {
        markType,
        refererUrl: `/prisoner/A12345/personal/${markType}/100`,
        selected: 'left-leg',
        verifiedSelection: 'leftLeg',
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async bodyPart => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        middleware: { clientToken: 'token' },
        query: { selected: bodyPart },
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeBodyPart(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeBodyPart', {
        markType: 'tattoo',
        refererUrl: '/prisoner/A12345/personal/tattoo/100',
        selected: bodyPart,
        verifiedSelection: bodyPartMap[bodyPart],
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeBodyPart(typeReq, res as Response)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('updateBodyPart', () => {
    it.each(Object.keys(bodyPartMap).filter(part => !['neck', 'back'].includes(part)))(
      'should update distinguishing mark with valid bodyPart and available locations (%s)',
      async bodyPart => {
        const submissionReq = {
          params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
          body: { bodyPart },
          middleware: { clientToken: 'token' },
        } as undefined as Request

        jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
        jest
          .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
          .mockResolvedValue(distinguishingMarkMock)

        await controller.updateBodyPart(submissionReq as Request, res as Response)

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
          params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
          body: { bodyPart },
          middleware: { clientToken: 'token' },
        } as undefined as Request

        jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
        jest
          .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
          .mockResolvedValue(distinguishingMarkMock)

        await controller.updateBodyPart(submissionReq as Request, res as Response)

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
        params: { prisonerNumber: 'A12345', markType: 'tattoos' },
        body: { bodyPart: 'somethingInvalid' },
        middleware: { clientToken: 'token' },
      } as undefined as Request

      jest
        .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
        .mockResolvedValue(distinguishingMarkMock)

      await controller.updateBodyPart(typeReq as Request, res as Response)
      expect(distinguishingMarksService.updateDistinguishingMarkLocation).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('changeLocation', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        params: {
          prisonerNumber: 'A12345',
          markType,
          markId: '100',
        },
        middleware: { clientToken: 'token' },
        query: { bodyPart: 'left-leg', referer: 'body-part' },
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(leftLegMarkMock)

      await controller.changeLocation(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeLocation', {
        markId: '100',
        markType,
        bodyPart: 'leftLeg',
        specificBodyPart: 'leftLeg',
        refererUrl: `/prisoner/A12345/personal/${markType}/100/body-part?selected=left-leg`,
        cancelUrl: `/prisoner/A12345/personal/${markType}/100`,
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async bodyPart => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        middleware: { clientToken: 'token' },
        query: { bodyPart, bodyPartChanged: 'true' },
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeLocation(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeLocation', {
        markId: '100',
        markType: 'tattoo',
        bodyPart: bodyPartMap[bodyPart],
        refererUrl: `/prisoner/A12345/personal/tattoo/100`,
        cancelUrl: `/prisoner/A12345/personal/tattoo/100`,
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeLocation(typeReq, res as Response)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })

    it('redirects back if the body part is invalid', async () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', bodyPart: 'invalidPart' },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeLocation(typeReq, res as Response)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('updateLocation', () => {
    it('should update distinguishing mark with valid location', async () => {
      const req = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: {
          specificBodyPart: 'lowerLeftArm',
        },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      jest
        .spyOn(distinguishingMarksService, 'updateDistinguishingMarkLocation')
        .mockResolvedValue(distinguishingMarkMock)

      await controller.updateLocation(req, res as Response)

      expect(distinguishingMarksService.updateDistinguishingMarkLocation).toHaveBeenCalledWith(
        'token',
        'A12345',
        '100',
        distinguishingMarkMock,
        'tattoo',
        'lowerLeftArm',
      )
    })
  })

  describe('changeDescription', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        params: {
          prisonerNumber: 'A12345',
          markType,
          markId: '100',
        },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(leftLegMarkMock)

      await controller.changeDescription(typeReq, { ...res, locals: {} } as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeDescription', {
        markId: '100',
        markType,
        formValues: { description: 'Comment' },
        refererUrl: `/prisoner/A12345/personal/${markType}/100`,
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeDescription(typeReq, { ...res, locals: {} } as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changeDescription', {
        markId: '100',
        markType: 'tattoo',
        formValues: { description: 'Horrible arm scar' },
        refererUrl: `/prisoner/A12345/personal/tattoo/100`,
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changeDescription(typeReq, res as Response)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#marks')
    })
  })

  describe('updateDescription', () => {
    it('should update distinguishing mark with description', async () => {
      const req = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: {
          description: 'description',
        },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)
      jest
        .spyOn(distinguishingMarksService, 'updateDistinguishingMarkDescription')
        .mockResolvedValue(distinguishingMarkMock)

      await controller.updateDescription(req, res as Response)

      expect(distinguishingMarksService.updateDistinguishingMarkDescription).toHaveBeenCalledWith(
        'token',
        'A12345',
        '100',
        distinguishingMarkMock,
        'tattoo',
        'description',
      )
    })
  })

  describe('changePhoto', () => {
    it.each(['tattoo', 'scar', 'mark'])('should return the mark type if it is valid (%s)', async markType => {
      const typeReq = {
        params: {
          prisonerNumber: 'A12345',
          markType,
          markId: '100',
          photoId: leftLegMarkMock.photographUuids[0].id,
        },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(leftLegMarkMock)

      await controller.changePhoto(typeReq, { ...res, locals: {} } as Response)

      const photoHtml = `<img src="/api/distinguishing-mark-image/${leftLegMarkMock.photographUuids[0].id}" alt="Image of ${leftLegMarkMock.markType.description} on ${getBodyPartDescription(leftLegMarkMock)}" width="150px" />`

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changePhoto', {
        markId: '100',
        markType,
        photoHtml,
        refererUrl: `/prisoner/A12345/personal/${markType}/100`,
        upload: false,
      })
    })

    it.each(Object.keys(bodyPartMap))('should render the view when bodyPart is %s', async () => {
      const typeReq = {
        params: {
          prisonerNumber: 'A12345',
          markType: 'tattoo',
          markId: '100',
          photoId: distinguishingMarkMock.photographUuids[0].id,
        },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changePhoto(typeReq, { ...res, locals: {} } as Response)

      const photoHtml = `<img src="/api/distinguishing-mark-image/${distinguishingMarkMock.photographUuids[0].id}" alt="Image of ${distinguishingMarkMock.markType.description} on ${getBodyPartDescription(distinguishingMarkMock)}" width="150px" />`

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/changePhoto', {
        markId: '100',
        markType: 'tattoo',
        photoHtml,
        refererUrl: `/prisoner/A12345/personal/tattoo/100`,
        upload: false,
      })
    })

    it('redirects back if the mark type is invalid', async () => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'invalidType', bodyPart: 'leftLeg' },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.changePhoto(typeReq, res as Response)

      expect(res.render).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#appearance')
    })
  })

  describe('updatePhoto', () => {
    it('should update an existing distinguishing mark photo', async () => {
      const req = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100', photoId: '123' },
        body: {},
        file: { originalname: 'file.jpg' },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'updateDistinguishingMarkPhoto').mockResolvedValue(distinguishingMarkMock)

      await controller.updatePhoto(req, res as Response)

      expect(distinguishingMarksService.updateDistinguishingMarkPhoto).toHaveBeenCalledWith('token', '123', {
        originalname: 'file.jpg',
      })
    })
  })

  describe('addPhoto', () => {
    it('should add a new distinguishing mark photo', async () => {
      const req = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: {},
        file: { originalname: 'file.jpg' },
        middleware: { clientToken: 'token' },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'addDistinguishingMarkPhoto').mockResolvedValue(distinguishingMarkMock)

      await controller.addPhoto(req, res as Response)

      expect(distinguishingMarksService.addDistinguishingMarkPhoto).toHaveBeenCalledWith('token', 'A12345', '100', {
        originalname: 'file.jpg',
      })
    })
  })

  describe('viewAllImages', () => {
    it('should display all images for a distinguishing mark', async () => {
      const req = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo', markId: '100' },
        body: {},
        middleware: { clientToken: 'token', prisonerData: { firstName: 'John', lastName: 'Smith' } },
        query: {},
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'getDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.viewAllImages(req, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/viewAllImages', {
        prisonerName: 'John Smith',
        prisonerNumber: 'A12345',
        mark: distinguishingMarkMock,
        markType: 'tattoo',
      })
    })
  })
})
