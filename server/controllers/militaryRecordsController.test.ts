import { NextFunction, Request, Response } from 'express'
import MilitaryRecordsController from './militaryRecordsController'
import MilitaryRecordsService from '../services/militaryRecordsService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import {
  DisciplinaryActionRefDataMock,
  MilitaryDischargeRefDataMock,
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
      const formValues = {
        militarySeq: MilitaryRecordsMock[0].militarySeq,
        serviceNumber: MilitaryRecordsMock[0].serviceNumber,
        militaryBranchCode: MilitaryRecordsMock[0].militaryBranchCode,
        militaryRankCode: MilitaryRecordsMock[0].militaryRankCode,
        startDate: MilitaryRecordsMock[0].startDate,
        enlistmentLocation: MilitaryRecordsMock[0].enlistmentLocation,
        description: MilitaryRecordsMock[0].description,
        'startDate-year': '2020',
        'startDate-month': '01',
        unitNumber: MilitaryRecordsMock[0].unitNumber,
      }

      await controller.displayMilitaryServiceInformation()(req, res, next)

      expect(getMilitaryRecords).toHaveBeenCalledWith('CLIENT_TOKEN', 'G6123VU')
      expect(getReferenceData).toHaveBeenCalledWith('CLIENT_TOKEN', ['MLTY_BRANCH', 'MLTY_RANK'])
      expect(res.render).toHaveBeenCalledWith('pages/militaryRecords/militaryServiceInformation', {
        pageTitle: 'UK military service information - Prisoner personal details',
        title: `John Saunders’ UK military service information`,
        militarySeq: 1,
        formValues,
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
        1,
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
        warZoneCode: 'AFG',
      }

      const updateMilitaryRecord = jest.spyOn(militaryRecordsService, 'updateMilitaryRecord').mockResolvedValue()

      await controller.postConflicts()(req, res, next)

      expect(updateMilitaryRecord).toHaveBeenCalledWith('CLIENT_TOKEN', expect.any(Object), 'G6123VU', 1, conflicts)
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal#military-service-information')
    })
  })

  describe('displayDisciplinaryAction', () => {
    it('should render the disciplinary action page', async () => {
      const getMilitaryRecords = jest
        .spyOn(militaryRecordsService, 'getMilitaryRecords')
        .mockResolvedValue(MilitaryRecordsMock)
      const getReferenceData = jest.spyOn(militaryRecordsService, 'getReferenceData').mockResolvedValue({
        disciplinaryAction: DisciplinaryActionRefDataMock,
      })

      await controller.displayDisciplinaryAction()(req, res, next)

      expect(getMilitaryRecords).toHaveBeenCalledWith('CLIENT_TOKEN', 'G6123VU')
      expect(getReferenceData).toHaveBeenCalledWith('CLIENT_TOKEN', ['MLTY_DISCP'])
      expect(res.render).toHaveBeenCalledWith('pages/militaryRecords/disciplinaryAction', {
        pageTitle: 'Disciplinary action - Prisoner personal details',
        title: 'Was John Saunders subject to any of the following disciplinary action?',
        militarySeq: 1,
        formValues: { militarySeq: 1, disciplinaryActionCode: 'CM' },
        errors: [],
        disciplinaryActionOptions: [
          ...objectToRadioOptions(
            DisciplinaryActionRefDataMock,
            'code',
            'description',
            MilitaryRecordsMock[0].disciplinaryActionCode,
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

  describe('postDisciplinaryAction', () => {
    it('should update disciplinary action and redirect', async () => {
      req.params.militarySeq = '1'
      req.body = {
        disciplinaryActionCode: 'CM',
      }
      const disciplinaryAction = {
        disciplinaryActionCode: 'CM',
      }

      const updateMilitaryRecord = jest.spyOn(militaryRecordsService, 'updateMilitaryRecord').mockResolvedValue()

      await controller.postDisciplinaryAction()(req, res, next)

      expect(updateMilitaryRecord).toHaveBeenCalledWith(
        'CLIENT_TOKEN',
        expect.any(Object),
        'G6123VU',
        1,
        disciplinaryAction,
      )
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal#military-service-information')
    })
  })

  describe('displayDischargeDetails', () => {
    it('should render the discharge details page', async () => {
      const getMilitaryRecords = jest
        .spyOn(militaryRecordsService, 'getMilitaryRecords')
        .mockResolvedValue(MilitaryRecordsMock)
      const getReferenceData = jest.spyOn(militaryRecordsService, 'getReferenceData').mockResolvedValue({
        militaryDischarge: MilitaryDischargeRefDataMock,
      })

      const formValues = {
        militarySeq: MilitaryRecordsMock[0].militarySeq,
        militaryDischargeCode: MilitaryRecordsMock[0].militaryDischargeCode,
        dischargeLocation: MilitaryRecordsMock[0].dischargeLocation,
      }

      await controller.displayDischargeDetails()(req, res, next)

      expect(getMilitaryRecords).toHaveBeenCalledWith('CLIENT_TOKEN', 'G6123VU')
      expect(getReferenceData).toHaveBeenCalledWith('CLIENT_TOKEN', ['MLTY_DSCHRG'])
      expect(res.render).toHaveBeenCalledWith('pages/militaryRecords/dischargeDetails', {
        pageTitle: 'Discharge details - Prisoner personal details',
        title: 'John Saunders’ discharge details',
        militarySeq: 1,
        formValues,
        errors: [],
        dischargeOptions: objectToRadioOptions(
          MilitaryDischargeRefDataMock,
          'code',
          'description',
          MilitaryRecordsMock[0].militaryDischargeCode,
        ),
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
          cellLocation: '1-1-035',
        },
      })
    })
  })

  describe('postDischargeDetails', () => {
    it('should update discharge details and redirect', async () => {
      req.params.militarySeq = '1'
      req.body = {
        militaryDischargeCode: 'HON',
        dischargeLocation: 'Location',
        'endDate-month': '01',
        'endDate-year': '2020',
      }
      const dischargeDetails = {
        militaryDischargeCode: 'HON',
        dischargeLocation: 'Location',
        endDate: '2020-01-01',
      }

      const updateMilitaryRecord = jest.spyOn(militaryRecordsService, 'updateMilitaryRecord').mockResolvedValue()

      await controller.postDischargeDetails()(req, res, next)

      expect(updateMilitaryRecord).toHaveBeenCalledWith(
        'CLIENT_TOKEN',
        expect.any(Object),
        'G6123VU',
        1,
        dischargeDetails,
      )
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal#military-service-information')
    })
  })
})
