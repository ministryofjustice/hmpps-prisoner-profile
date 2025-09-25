import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import ProfessionalContactsService from '../services/professionalContactsService'
import ProfessionalContactsController from './professionalContactsController'
import { Result } from '../utils/result/result'

describe('Prisoner schedule', () => {
  const offenderNo = 'A1234BC'

  let req: any
  let res: any
  let controller: ProfessionalContactsController

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
    res = { locals: {}, render: jest.fn(), status: jest.fn() }
    controller = new ProfessionalContactsController(new ProfessionalContactsService(null, null, null, null, null))
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayProfessionalContacts', () => {
    it('should call the service and render the page', async () => {
      const professionalContacts = [
        Result.fulfilled({
          relationship: 'Prison Offender Manager',
          contacts: [
            {
              jobTitle: false,
              name: 'John Smith',
            },
            {
              jobTitle: 'Co-worker',
              name: 'Jane Jones',
            },
          ],
        }).toPromiseSettledResult(),
      ]
      jest
        .spyOn<any, string>(controller['professionalContactsService'], 'getContacts')
        .mockResolvedValue(professionalContacts.map(Result.from))

      await controller.displayProfessionalContacts(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/professionalContacts/professionalContactsPage', {
        professionalContacts,
      })
    })
  })
})
