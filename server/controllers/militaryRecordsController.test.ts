import { NextFunction, Request, Response } from 'express'
import MilitaryRecordsController from './militaryRecordsController'
import MilitaryRecordsService from '../services/militaryRecordsService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import {
  MilitaryRecordsMock,
  MilitaryWarZoneRefDataMock,
} from '../data/localMockData/personIntegrationApiReferenceDataMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { objectToRadioOptions } from '../utils/utils'

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

  describe('displayConflicts', () => {
    it('should render the conflicts page', async () => {
      const getMilitaryRecords = jest
        .spyOn(militaryRecordsService, 'getMilitaryRecords')
        .mockResolvedValue(MilitaryRecordsMock)
      const getReferenceData = jest.spyOn(militaryRecordsService, 'getReferenceData').mockResolvedValue({
        warZone: MilitaryWarZoneRefDataMock,
      })

      await controller.displayConflicts()(req, res, next)

      expect(getMilitaryRecords).toHaveBeenCalledWith('CLIENT_TOKEN', 'G6123VU')
      expect(getReferenceData).toHaveBeenCalledWith('CLIENT_TOKEN', ['MLTY_WZONE'])
      expect(res.render).toHaveBeenCalledWith('pages/militaryRecords/conflicts', {
        pageTitle: 'Most recent conflict - Prisoner personal details',
        title: 'What was the most recent conflict John Saunders served in?',
        militarySeq: 1,
        formValues: { militarySeq: 1, warZoneCode: 'AFG' },
        errors: [],
        warZoneOptions: [
          ...objectToRadioOptions(
            MilitaryWarZoneRefDataMock,
            'code',
            'description',
            MilitaryRecordsMock[0].warZoneCode,
          ),
          { divider: 'or' },
          { text: 'Unknown', value: null },
        ],
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
          cellLocation: '1-1-035',
        },
      })
    })
  })

  describe('postConflicts', () => {
    it('should update conflict and redirect', async () => {
      req.params.militarySeq = '1'
      req.body = {
        warZoneCode: 'AFG',
      }
      const conflicts = {
        militarySeq: 1,
        warZoneCode: 'AFG',
      }

      const updateMilitaryRecord = jest.spyOn(militaryRecordsService, 'updateMilitaryRecord').mockResolvedValue()

      await controller.postConflicts()(req, res, next)

      expect(updateMilitaryRecord).toHaveBeenCalledWith('CLIENT_TOKEN', expect.any(Object), 'G6123VU', conflicts)
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal#military-service-information')
    })
  })
})
