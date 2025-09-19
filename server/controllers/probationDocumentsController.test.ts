import { Request, Response } from 'express'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import ProbationDocumentsController from './probationDocumentsController'
import ProbationDocumentsService, { GetCommunityDocumentsResponse } from '../services/probationDocumentsService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import config from '../config'
import { Result } from '../utils/result/result'

describe('Prisoner schedule', () => {
  const offenderNo = 'A1234BC'

  let req: Request
  let res: Response
  let controller: ProbationDocumentsController

  beforeEach(() => {
    req = {
      middleware: {
        prisonerData: PrisonerMockDataA,
        inmateDetail: inmateDetailMock,
      },
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    } as unknown as Request
    res = { locals: { user: {} }, render: jest.fn(), status: jest.fn() } as unknown as Response

    controller = new ProbationDocumentsController(new ProbationDocumentsService(null), auditServiceMock())
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayDocuments', () => {
    it('should call the service and render the page', async () => {
      const probationDocuments: GetCommunityDocumentsResponse = {
        documents: { offenderDocuments: [], convictions: [] },
        probationDetails: { name: 'John Saunders', crn: 'crn' },
      }
      const result = Result.fulfilled<GetCommunityDocumentsResponse, Error>(probationDocuments)

      jest.spyOn(controller.probationDocumentsService, 'getDocuments').mockResolvedValue(result)

      await controller.displayDocuments(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/probationDocuments/probationDocuments', {
        pageTitle: 'Probation documents',
        probationDocuments: expect.objectContaining({ status: 'fulfilled', value: probationDocuments }),
        dpsUrl: config.serviceUrls.digitalPrison,
      })
    })
  })
})
