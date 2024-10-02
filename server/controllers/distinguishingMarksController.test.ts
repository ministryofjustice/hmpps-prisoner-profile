import { Request, Response } from 'express'
import DistinguishingMarksController from './distinguishingMarksController'
import DistinguishingMarksService from '../services/distinguishingMarksService'
import { distinguishingMarkMock } from '../data/localMockData/distinguishingMarksMock'
import { bodyPartSelections, markTypeSelections } from './interfaces/distinguishingMarks/selectionTypes'

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
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#appearance')
    })

    it.each(bodyPartSelections)('should add a valid selection (%s)', bodyPart => {
      const typeReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        query: { selected: bodyPart },
      } as undefined as Request
      controller.newDistinguishingMark(typeReq, res as Response)

      expect(res.render).toHaveBeenCalledWith('pages/distinguishingMarks/addNewDistinguishingMark', {
        markType: 'tattoo',
        selected: bodyPart,
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
        selected: undefined,
      })
    })
  })

  describe('addDistinguishingMark', () => {
    it.each(bodyPartSelections)('should add a new distinguishing mark with valid bodyPart (%s)', async bodyPart => {
      const submissionReq = {
        params: { prisonerNumber: 'A12345', markType: 'tattoo' },
        body: { bodyPart },
        middleware: { clientToken: 'token' },
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMark(submissionReq as Request, res as Response)

      expect(distinguishingMarksService.postNewDistinguishingMark).toHaveBeenCalledWith(
        'token',
        'A12345',
        'tattoo',
        bodyPart,
      )
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/A12345/personal#appearance`)
    })

    it.each(markTypeSelections)('should add a new distinguishing mark with valid mark type (%s)', async markType => {
      const submissionReq = {
        params: { prisonerNumber: 'A12345', markType },
        body: { bodyPart: 'leftLeg' },
        middleware: { clientToken: 'token' },
      } as undefined as Request

      jest.spyOn(distinguishingMarksService, 'postNewDistinguishingMark').mockResolvedValue(distinguishingMarkMock)

      await controller.postNewDistinguishingMark(submissionReq as Request, res as Response)

      expect(distinguishingMarksService.postNewDistinguishingMark).toHaveBeenCalledWith(
        'token',
        'A12345',
        markType,
        'leftLeg',
      )
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/A12345/personal#appearance`)
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
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/personal#appearance')
    })
  })
})
