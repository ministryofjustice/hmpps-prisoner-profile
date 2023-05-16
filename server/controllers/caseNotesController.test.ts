import { prisonerDetailMock } from '../data/localMockData/prisonerDetailMock'
import * as headerMappers from '../mappers/headerMappers'
import CaseNotesController from './caseNotesController'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import { caseNoteUsageMock } from '../data/localMockData/caseNoteUsageMock'

let req: any
let res: any
let controller: any

jest.mock('../services/prisonerSearch.ts')
jest.mock('../services/caseNotesService.ts')
jest.mock('../data/prisonApiClient.ts')

describe('Case Notes Controller', () => {
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
          staffId: 487023,
        },
      },
      render: jest.fn(),
    }
    controller = new CaseNotesController(res.locals.clientToken, res.locals.user.token)
  })

  it('should get case notes', async () => {
    const getPrisonerDetailsSpy = jest
      .spyOn<any, string>(controller['prisonerSearchService'], 'getPrisonerDetails')
      .mockResolvedValue(prisonerDetailMock)
    const getgetCaseNotesUsageSpy = jest
      .spyOn<any, string>(controller['prisonApiClient'], 'getCaseNotesUsage')
      .mockResolvedValue(caseNoteUsageMock)
    const getCaseNotesSpy = jest
      .spyOn<any, string>(controller['caseNotesService'], 'get')
      .mockResolvedValue(pagedCaseNotesMock)
    const mapSpy = jest.spyOn(headerMappers, 'mapHeaderData')

    await controller.displayCaseNotes(req, res)
    expect(getPrisonerDetailsSpy).toHaveBeenCalledWith(req.params.prisonerNumber)
    expect(getgetCaseNotesUsageSpy).toHaveBeenCalledWith(req.params.prisonerNumber)
    expect(getCaseNotesSpy).toHaveBeenCalledWith(
      prisonerDetailMock,
      {
        page: 0,
        sort: 'dateCreated,ASC',
        type: 'ACP',
        subType: 'ASSESSMENT',
        startDate: '01/01/2023',
        endDate: '02/02/2023',
      },
      false,
    )
    expect(mapSpy).toHaveBeenCalledWith(prisonerDetailMock, true, 'case-notes')
  })
})
