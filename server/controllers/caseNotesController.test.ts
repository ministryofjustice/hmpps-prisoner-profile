import * as headerMappers from '../mappers/headerMappers'
import CaseNotesController from './caseNotesController'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import { caseNoteUsageMock } from '../data/localMockData/caseNoteUsageMock'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { PrisonerSearchService } from '../services'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import CaseNotesService from '../services/caseNotesService'

let req: any
let res: any
let controller: any

jest.mock('../services/prisonerSearch.ts')
jest.mock('../services/caseNotesService.ts')
jest.mock('../data/prisonApiClient.ts')

describe('Case Notes Controller', () => {
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    req = {
      params: { prisonerNumber: '' },
      query: {
        page: '0',
        sort: 'dateCreated,ASC',
        type: 'ACP',
        subType: 'ASSESSMENT',
        startDate: '01/01/2023',
        endDate: '02/02/2023',
      },
      path: 'case-notes',
    }
    res = {
      locals: {
        clientToken: 'CLIENT_TOKEN',
        user: {
          userRoles: [Role.DeleteSensitiveCaseNotes],
          staffId: 487023,
          caseLoads: CaseLoadsDummyDataA,
        },
      },
      render: jest.fn(),
    }

    prisonApiClient = prisonApiClientMock()
    prisonApiClient.getCaseNotesUsage = jest.fn(async () => caseNoteUsageMock)
    controller = new CaseNotesController(
      () => prisonApiClient,
      new PrisonerSearchService(null),
      new CaseNotesService(null),
    )
  })

  it('should get case notes', async () => {
    const getPrisonerDetailsSpy = jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(PrisonerMockDataA)
    const getCaseNotesSpy = jest
      .spyOn<any, string>(controller['caseNotesService'], 'get')
      .mockResolvedValue(pagedCaseNotesMock)
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayCaseNotes(req, res)
    expect(getPrisonerDetailsSpy).toHaveBeenCalledWith(res.locals.clientToken, req.params.prisonerNumber)
    expect(prisonApiClient.getCaseNotesUsage).toHaveBeenCalledWith(req.params.prisonerNumber)
    expect(getCaseNotesSpy).toHaveBeenCalledWith(
      res.locals.user.token,
      PrisonerMockDataA,
      {
        page: 0,
        sort: 'dateCreated,ASC',
        type: 'ACP',
        subType: 'ASSESSMENT',
        startDate: '01/01/2023',
        endDate: '02/02/2023',
      },
      true,
    )
    expect(mapSpy).toHaveBeenCalledWith(PrisonerMockDataA, res.locals.user, 'case-notes')
  })
})
