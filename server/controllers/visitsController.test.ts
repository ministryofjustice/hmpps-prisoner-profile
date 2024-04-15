import { VisitsService } from '../services/visitsService'
import { VisitsController } from './visitsController'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { pagedVisitsMock } from '../data/localMockData/pagedVisitsWithVisitors'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { mockReferenceDomains } from '../data/localMockData/referenceDomains'
import { ReferenceCodeDomain } from '../data/interfaces/prisonApi/ReferenceCode'

describe('Visits controller', () => {
  let controller: VisitsController
  let visitsService: VisitsService
  let req: any
  let res: any

  beforeEach(() => {
    visitsService = {
      sortVisitors: jest.fn(() => [pagedVisitsMock.content[0].visitors[0]]),
      getVisits: jest.fn(() => ({
        completionReasons: mockReferenceDomains(ReferenceCodeDomain.VisitCompletionReasons),
        cancellationReasons: mockReferenceDomains(ReferenceCodeDomain.VisitCancellationReasons),
        prisons: [
          { prisonId: 'MDI', prison: 'Moorland' },
          { prisonId: 'LEI', prison: 'Leeds' },
        ],
        visitsWithPaginationInfo: pagedVisitsMock,
      })),
    } as any

    req = {
      params: { prisonerNumber: 'G6123VU' },
      query: {},
      headers: {
        referer: 'http://referer',
      },
      middleware: {
        prisonerData: PrisonerMockDataA,
        clientToken: 'CLIENT_TOKEN',
      },
      path: 'case-notes',
      session: {
        userDetails: { displayName: 'A Name' },
      },
      flash: jest.fn(),
    }
    res = {
      locals: {
        user: {
          username: 'AB123456',
          userRoles: [Role.DeleteSensitiveCaseNotes],
          staffId: 487023,
          caseLoads: CaseLoadsDummyDataA,
          token: 'USER_TOKEN',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    }

    controller = new VisitsController(visitsService)
  })

  it('Gets the visits from the service', async () => {
    await controller.visitsDetails()(req, res, jest.fn())
    expect(visitsService.getVisits).toHaveBeenCalledWith('CLIENT_TOKEN', PrisonerMockDataA, {})
  })

  describe('Rendering the view', () => {
    const page = 'pages/visitsDetails'

    it('Provides prisoner information', async () => {
      await controller.visitsDetails()(req, res, jest.fn())
      expect(res.render).toHaveBeenCalledWith(
        page,
        expect.objectContaining({
          prisonerName: {
            first: PrisonerMockDataA.firstName,
            last: PrisonerMockDataA.lastName,
            breadcrumb: formatName(PrisonerMockDataA.firstName, '', PrisonerMockDataA.lastName, {
              style: NameFormatStyle.lastCommaFirst,
            }),
          },
          prisonerNumber: PrisonerMockDataA.prisonerNumber,
        }),
      )
    })

    it('Formats the visit reasons into statuses for the dropdown', async () => {
      await controller.visitsDetails()(req, res, jest.fn())
      expect(res.render).toHaveBeenCalledWith(
        page,
        expect.objectContaining({
          statuses: expect.arrayContaining([
            expect.objectContaining({ value: 'CANC-ADMIN', text: 'Cancelled: Administrative Cancellation' }),
            expect.objectContaining({ value: 'NORM', text: 'Normal Completion' }),
            expect.objectContaining({ value: 'SCH', text: 'Scheduled' }),
            expect.objectContaining({ value: 'EXP', text: 'Not entered' }),
          ]),
        }),
      )
    })

    it('Formats the prison for the dropdown', async () => {
      await controller.visitsDetails()(req, res, jest.fn())
      expect(res.render).toHaveBeenCalledWith(
        page,
        expect.objectContaining({
          prisons: [
            { value: 'MDI', text: 'Moorland' },
            { value: 'LEI', text: 'Leeds' },
          ],
        }),
      )
    })

    it('Provides the visits with sorted visitors', async () => {
      await controller.visitsDetails()(req, res, jest.fn())
      expect(visitsService.sortVisitors).toHaveBeenCalledWith(pagedVisitsMock.content[0].visitors)
    })

    describe('with filters', () => {
      it.each([
        ['CANC-ADMIN', { statusToSearch: 'CANC', cancellationReasonToSearch: 'ADMIN' }],
        ['NORM', { statusToSearch: 'NORM', cancellationReasonToSearch: undefined }],
      ])(
        'Parses the filters and passes them to the visits service (visitStatus: %s)',
        async (visitStatus, { statusToSearch, cancellationReasonToSearch }) => {
          req.query = {
            visitStatus,
            fromDate: '13/12/2020',
            toDate: '13/12/2021',
            page: '1',
            visitType: 'SCON',
            prisonId: 'LEI',
          }

          await controller.visitsDetails()(req, res, jest.fn())

          expect(visitsService.getVisits).toHaveBeenCalledWith('CLIENT_TOKEN', PrisonerMockDataA, {
            page: 1,
            visitType: 'SCON',
            prisonId: 'LEI',
            fromDate: '2020-12-13',
            toDate: '2021-12-13',
            visitStatus: statusToSearch,
            cancellationReason: cancellationReasonToSearch,
          })
        },
      )
    })
  })
})
