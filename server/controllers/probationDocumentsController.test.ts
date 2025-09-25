import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import ProbationDocumentsController from './probationDocumentsController'
import ProbationDocumentsService from '../services/probationDocumentsService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import config from '../config'
import { ProbationDocument } from '../data/interfaces/deliusApi/ProbationDocuments'
import Conviction from '../data/interfaces/deliusApi/Conviction'
import { Result } from '../utils/result/result'

describe('Prisoner schedule', () => {
  const offenderNo = 'A1234BC'

  let req: any
  let res: any
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
    }
    res = { locals: { user: {} }, render: jest.fn(), status: jest.fn() }

    controller = new ProbationDocumentsController(new ProbationDocumentsService(null), auditServiceMock())
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayDocuments', () => {
    it('should call the service and render the page', async () => {
      const probationDocuments = {
        documents: { offenderDocuments: [] as ProbationDocument[], convictions: [] as Conviction[] },
      }
      const result = Result.fulfilled(probationDocuments)

      jest.spyOn<any, string>(controller['probationDocumentsService'], 'getDocuments').mockResolvedValue(result)

      await controller.displayDocuments(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/probationDocuments/probationDocuments', {
        pageTitle: 'Probation documents',
        probationDocuments: expect.objectContaining({ status: 'fulfilled', value: probationDocuments }),
        dpsUrl: config.serviceUrls.digitalPrison,
      })
    })
  })
})
