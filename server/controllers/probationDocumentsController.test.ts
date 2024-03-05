import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import ProbationDocumentsController from './probationDocumentsController'
import ProbationDocumentsService from '../services/probationDocumentsService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import config from '../config'
import { ProbationDocument } from '../data/interfaces/deliusApi/ProbationDocuments'
import Conviction from '../data/interfaces/deliusApi/Conviction'

describe('Prisoner schedule', () => {
  const offenderNo = 'ABC123'

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

  describe('displayProfessionalContacts', () => {
    it('should call the service and render the page', async () => {
      const probationDocuments = {
        notFound: false,
        data: { documents: { offenderDocuments: [] as ProbationDocument[], convictions: [] as Conviction[] } },
      }
      jest
        .spyOn<any, string>(controller['probationDocumentsService'], 'getDocuments')
        .mockResolvedValue(probationDocuments)

      await controller.displayDocuments(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/probationDocuments/probationDocuments', {
        ...probationDocuments.data,
        prisonerNumber: 'G6123VU',
        dpsUrl: config.serviceUrls.digitalPrison,
        prisonerBreadcrumbName: 'Saunders, John',
        probationDocumentsNotFound: probationDocuments.notFound,
      })
    })
  })
})
