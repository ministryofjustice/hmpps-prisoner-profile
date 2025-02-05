import { NextFunction, Request, Response } from 'express'
import MilitaryRecordsController from './militaryRecordsController'
import MilitaryRecordsService from '../services/militaryRecordsService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { MilitaryRecordsMock } from '../data/localMockData/personIntegrationReferenceDataMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'

describe('MilitaryRecordsController', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let militaryRecordsService: MilitaryRecordsService
  let controller: MilitaryRecordsController

  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU', militarySeq: '1' },
      middleware: { clientToken: 'CLIENT_TOKEN', prisonerData: PrisonerMockDataA },
      flash: jest.fn().mockReturnValue([]),
      body: {},
    } as unknown as Request
    res = {
      locals: { user: { username: 'testuser' } },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
    next = jest.fn()
    militaryRecordsService = {
      getMilitaryRecords: jest.fn(),
      getReferenceData: jest.fn(),
      createMilitaryRecord: jest.fn(),
      updateMilitaryRecord: jest.fn(),
    } as unknown as MilitaryRecordsService
    controller = new MilitaryRecordsController(militaryRecordsService, auditServiceMock())
  })

  describe('displayMilitaryServiceInformation', () => {
    it('should render the military service information page', async () => {
      const getMilitaryRecords = jest
        .spyOn(militaryRecordsService, 'getMilitaryRecords')
        .mockResolvedValue(MilitaryRecordsMock)
      const getReferenceData = jest.spyOn(militaryRecordsService, 'getReferenceData').mockResolvedValue({
        militaryRank: [],
        militaryBranch: [],
      })

      await controller.displayMilitaryServiceInformation()(req, res, next)

      expect(getMilitaryRecords).toHaveBeenCalledWith('CLIENT_TOKEN', 'G6123VU')
      expect(getReferenceData).toHaveBeenCalledWith('CLIENT_TOKEN', ['MLTY_BRANCH', 'MLTY_RANK'])
      expect(res.render).toHaveBeenCalledWith('pages/militaryRecords/militaryServiceInformation', {
        pageTitle: 'UK military service information - Prisoner personal details',
        title: `John Saunders’ UK military service information`,
        militarySeq: 1,
        formValues: { ...MilitaryRecordsMock[0], 'startDate-year': '2020', 'startDate-month': '01' },
        errors: [],
        militaryBranchOptions: [],
        rankOptionsArmy: [],
        rankOptionsNavy: [],
        rankOptionsRAF: [],
        rankOptionsRoyalMarines: [],
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
          cellLocation: '1-1-035',
        },
      })
    })
  })

  describe('postMilitaryServiceInformation', () => {
    it('should create a new military record and redirect', async () => {
      req.params.militarySeq = undefined
      req.body = {
        serviceNumber: '123456',
        militaryBranchCode: 'ARM',
        militaryRankCode: 'PVT',
        'startDate-month': '01',
        'startDate-year': '2020',
        enlistmentLocation: 'Location',
        description: 'Description',
      }
      const militaryServiceInformation = {
        serviceNumber: '123456',
        militaryBranchCode: 'ARM',
        militaryRankCode: 'PVT',
        startDate: '2020-01-01',
        enlistmentLocation: 'Location',
        description: 'Description',
      }
      const createMilitaryRecord = jest.spyOn(militaryRecordsService, 'createMilitaryRecord').mockResolvedValue()

      await controller.postMilitaryServiceInformation()(req, res, next)

      expect(createMilitaryRecord).toHaveBeenCalledWith(
        'CLIENT_TOKEN',
        res.locals.user,
        'G6123VU',
        militaryServiceInformation,
      )
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal#military-service-information')
    })

    it('should update an existing military record and redirect', async () => {
      req.params.militarySeq = '1'
      req.body = {
        serviceNumber: '123456',
        militaryBranchCode: 'ARM',
        militaryRankCode: 'PVT',
        'startDate-month': '01',
        'startDate-year': '2020',
        enlistmentLocation: 'Location',
        description: 'Description',
      }
      const militaryServiceInformation = {
        militarySeq: 1,
        serviceNumber: '123456',
        militaryBranchCode: 'ARM',
        militaryRankCode: 'PVT',
        startDate: '2020-01-01',
        enlistmentLocation: 'Location',
        description: 'Description',
      }

      const updateMilitaryRecord = jest.spyOn(militaryRecordsService, 'updateMilitaryRecord').mockResolvedValue()

      await controller.postMilitaryServiceInformation()(req, res, next)

      expect(updateMilitaryRecord).toHaveBeenCalledWith(
        'CLIENT_TOKEN',
        expect.any(Object),
        'G6123VU',
        militaryServiceInformation,
      )
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal#military-service-information')
    })
  })
})
