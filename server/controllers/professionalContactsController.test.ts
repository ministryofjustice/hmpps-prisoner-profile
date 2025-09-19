import { Request, Response } from 'express'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import ProfessionalContactsService from '../services/professionalContactsService'
import ProfessionalContactsController from './professionalContactsController'
import { Result } from '../utils/result/result'

describe('Prisoner schedule', () => {
  const offenderNo = 'A1234BC'

  let req: Request
  let res: Response
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
    } as unknown as Request
    res = { locals: {}, render: jest.fn(), status: jest.fn() } as unknown as Response
    controller = new ProfessionalContactsController(new ProfessionalContactsService(null, null, null, null, null))
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
  })

  describe('displayProfessionalContacts', () => {
    it('should call the service and render the page', async () => {
      const professionalContacts: Awaited<
        ReturnType<ProfessionalContactsController['professionalContactsService']['getContacts']>
      > = [
        Result.fulfilled({
          relationship: 'POM',
          relationshipDescription: 'Prison Offender Manager',
          emails: ['john.smith@localhost'],
          firstName: 'John',
          lastName: 'Smith',
          phones: [],
        }),
      ]
      jest.spyOn(controller.professionalContactsService, 'getContacts').mockResolvedValue(professionalContacts)

      await controller.displayProfessionalContacts(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/professionalContacts/professionalContactsPage', {
        professionalContacts: professionalContacts.map(professionalContact =>
          professionalContact.toPromiseSettledResult(),
        ),
      })
    })
  })
})
