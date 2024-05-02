import { format } from 'date-fns'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import MoneyController from './moneyController'
import MoneyService from '../services/moneyService'
import { accountBalancesMock } from '../data/localMockData/miniSummaryMock'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import {
  batchTransactionsMock,
  bonusPayTransactionsMock,
  pieceWorkTransactionsMock,
  transactionsMock,
} from '../data/localMockData/transactionsMock'
import { damageObligationsMock } from '../data/localMockData/damageObligationsMock'
import { AccountCode } from '../data/enums/accountCode'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { Page } from '../services/auditService'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'

let req: any
let res: any
let next: any
let controller: MoneyController

jest.mock('../services/moneyService.ts')

describe('Money Controller', () => {
  let moneyService: MoneyService

  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'A9999AA' },
      query: {},
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
      },
      headers: {
        referer: 'http://referer',
      },
      path: 'money/spends',
      flash: jest.fn(),
    }
    res = {
      locals: {
        user: {
          displayName: 'A Name',
          userRoles: [Role.PrisonUser],
          staffId: 487023,
          caseLoads: CaseLoadsDummyDataA,
          token: 'USER_TOKEN',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    }

    moneyService = new MoneyService(null)
    moneyService.getAccountBalances = jest.fn(async () => accountBalancesMock)
    moneyService.getAgencyDetails = jest.fn(async () => AgenciesMock)
    moneyService.getTransactions = jest.fn(async () => transactionsMock)
    moneyService.getDamageObligations = jest.fn(async () => damageObligationsMock)
    controller = new MoneyController(moneyService, auditServiceMock())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should display spends', async () => {
    const getTransactions = jest.spyOn<any, string>(controller, 'getTransactions')

    await controller.displaySpends()(req, res, next)

    expect(getTransactions).toHaveBeenCalledWith(AccountCode.Spends, 'Spends', Page.MoneySpends, req, res)
  })

  it('should display private cash', async () => {
    const getTransactions = jest.spyOn<any, string>(controller, 'getTransactions')

    await controller.displayPrivateCash()(req, res, next)

    expect(getTransactions).toHaveBeenCalledWith(
      AccountCode.PrivateCash,
      'Private cash',
      Page.MoneyPrivateCash,
      req,
      res,
    )
  })

  it('should display savings', async () => {
    const getTransactions = jest.spyOn<any, string>(controller, 'getTransactions')

    await controller.displaySavings()(req, res, next)

    expect(getTransactions).toHaveBeenCalledWith(AccountCode.Savings, 'Savings', Page.MoneySavings, req, res)
  })

  it('should display damage obligations', async () => {
    const getDamageObligations = jest.spyOn<any, string>(controller, 'getDamageObligations')

    await controller.displayDamageObligations()(req, res, next)

    expect(getDamageObligations).toHaveBeenCalledWith(req, res)
  })

  it('should get damage obligations', async () => {
    const mapToObligationTableRows = jest.spyOn<any, string>(controller, 'mapToObligationTableRows')
    const getRefData = jest.spyOn<any, string>(controller, 'getRefData')
    const getLast4Years = jest.spyOn<any, string>(controller, 'getLast4Years').mockReturnValue([
      { text: 2023, value: 2023 },
      { text: 2022, value: 2022 },
      { text: 2021, value: 2021 },
      { text: 2020, value: 2020 },
    ])

    await controller['getDamageObligations'](req, res)

    expect(moneyService.getAccountBalances).toHaveBeenCalledWith(
      req.middleware.clientToken,
      req.middleware.prisonerData.bookingId,
    )
    expect(moneyService.getDamageObligations).toHaveBeenCalledWith(
      req.middleware.clientToken,
      req.middleware.prisonerData.prisonerNumber,
    )
    expect(mapToObligationTableRows).toHaveBeenCalledWith(damageObligationsMock, [AgenciesMock])
    expect(getRefData).toHaveBeenCalledWith(req.middleware.prisonerData)
    expect(getLast4Years).toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith('pages/money/damageObligations', {
      pageTitle: 'Damage obligations',
      showDamageObligationsTab: true,
      breadcrumbPrisonerName: 'Saunders, John',
      prisonerName: 'John Saunders',
      prisonerNumber: 'G6123VU',
      months: [
        { text: 'January', value: 0 },
        { text: 'February', value: 1 },
        { text: 'March', value: 2 },
        { text: 'April', value: 3 },
        { text: 'May', value: 4 },
        { text: 'June', value: 5 },
        { text: 'July', value: 6 },
        { text: 'August', value: 7 },
        { text: 'September', value: 8 },
        { text: 'October', value: 9 },
        { text: 'November', value: 10 },
        { text: 'December', value: 11 },
      ],
      years: [
        { text: 2023, value: 2023 },
        { text: 2022, value: 2022 },
        { text: 2021, value: 2021 },
        { text: 2020, value: 2020 },
      ],
      currentlyOwes: accountBalancesMock[AccountCode.DamageObligations],
      obligations: [
        [
          { text: 2 },
          { text: '98765456' },
          { text: '10/09/2023 to 10/09/2025' },
          { text: '£10.00', format: 'numeric' },
          { text: '£0.00', format: 'numeric' },
          { text: '£10.00', format: 'numeric' },
          { text: 'Moorland (HMP & YOI) - Comment' },
        ],
        [
          { text: 1 },
          { text: '1234567' },
          { text: '09/09/2023 to 09/09/2025' },
          { text: '£50.00', format: 'numeric' },
          { text: '£25.00', format: 'numeric' },
          { text: '£25.00', format: 'numeric' },
          { text: 'Moorland (HMP & YOI) - Comment' },
        ],
      ],
    })
  })

  it('Should get transactions for January (month 0)', async () => {
    jest.spyOn<any, string>(controller, 'mapToTableRows')
    jest.spyOn<any, string>(controller, 'getRefData')
    jest.spyOn<any, string>(controller, 'getLast4Years').mockReturnValue([
      { text: 2023, value: 2023 },
      { text: 2022, value: 2022 },
      { text: 2021, value: 2021 },
      { text: 2020, value: 2020 },
    ])

    await controller['getTransactions'](
      AccountCode.Spends,
      'Spends',
      Page.MoneySpends,
      { ...req, query: { month: '0', year: '2023' } } as any,
      res,
    )

    expect(moneyService.getTransactions).toHaveBeenCalledWith(
      req.middleware.clientToken,
      req.middleware.prisonerData.prisonerNumber,
      AccountCode.Spends,
      0,
      2023,
    )
  })

  it('should get transactions', async () => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const mapToTableRows = jest.spyOn<any, string>(controller, 'mapToTableRows')
    const getRefData = jest.spyOn<any, string>(controller, 'getRefData')
    const getLast4Years = jest.spyOn<any, string>(controller, 'getLast4Years').mockReturnValue([
      { text: 2023, value: 2023 },
      { text: 2022, value: 2022 },
      { text: 2021, value: 2021 },
      { text: 2020, value: 2020 },
    ])

    await controller['getTransactions'](AccountCode.Spends, 'Spends', Page.MoneySpends, req, res)

    expect(moneyService.getAccountBalances).toHaveBeenCalledWith(
      req.middleware.clientToken,
      req.middleware.prisonerData.bookingId,
    )
    expect(moneyService.getTransactions).toHaveBeenCalledWith(
      req.middleware.clientToken,
      req.middleware.prisonerData.prisonerNumber,
      AccountCode.Spends,
      month,
      year,
    )
    expect(mapToTableRows).toHaveBeenCalledWith(
      [...batchTransactionsMock, ...bonusPayTransactionsMock, ...pieceWorkTransactionsMock]
        .filter(tx => !!tx.penceAmount)
        .sort(controller['transactionSort']),
      [AgenciesMock],
    )
    expect(getRefData).toHaveBeenCalledWith(req.middleware.prisonerData)
    expect(getLast4Years).toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith('pages/money/transactions', {
      pageTitle: 'Spends account',
      showDamageObligationsTab: true,
      breadcrumbPrisonerName: 'Saunders, John',
      prisonerName: 'John Saunders',
      prisonerNumber: 'G6123VU',
      months: [
        { text: 'January', value: 0 },
        { text: 'February', value: 1 },
        { text: 'March', value: 2 },
        { text: 'April', value: 3 },
        { text: 'May', value: 4 },
        { text: 'June', value: 5 },
        { text: 'July', value: 6 },
        { text: 'August', value: 7 },
        { text: 'September', value: 8 },
        { text: 'October', value: 9 },
        { text: 'November', value: 10 },
        { text: 'December', value: 11 },
      ],
      years: [
        { text: 2023, value: 2023 },
        { text: 2022, value: 2022 },
        { text: 2021, value: 2021 },
        { text: 2020, value: 2020 },
      ],
      currentBalance: accountBalancesMock[AccountCode.Spends],
      pendingBalance: 0,
      formValues: {
        month,
        year,
      },
      period: format(new Date(year, month), 'MMMM yyyy'),
      transactions: [
        [
          { text: '16/09/2023' },
          { text: '£16.80', format: 'numeric' },
          { text: '', format: 'numeric' },
          { text: '£37.80', format: 'numeric' },
          { text: 'Piece work for Some payment from 15/09/2023' },
          { text: 'Moorland (HMP & YOI)' },
        ],
        [
          { text: '11/09/2023' },
          { text: '£1.00', format: 'numeric' },
          { text: '', format: 'numeric' },
          { text: '£21.00', format: 'numeric' },
          { text: 'A Payment 3 from 11/09/2023' },
          { text: 'Moorland (HMP & YOI)' },
        ],
        [
          { text: '11/09/2023' },
          { text: '£1.00', format: 'numeric' },
          { text: '', format: 'numeric' },
          { text: '£20.00', format: 'numeric' },
          { text: 'A Payment 2 from 11/09/2023' },
          { text: 'Moorland (HMP & YOI)' },
        ],
        [
          { text: '11/09/2023' },
          { text: '£1.00', format: 'numeric' },
          { text: '', format: 'numeric' },
          { text: '£19.00', format: 'numeric' },
          { text: 'A Payment 1 from 11/09/2023' },
          { text: 'Moorland (HMP & YOI)' },
        ],
        [
          { text: '11/09/2023' },
          { text: '£7.00', format: 'numeric' },
          { text: '', format: 'numeric' },
          { text: '£18.00', format: 'numeric' },
          { text: 'Bonus pay for A Payment 2 from 11/09/2023' },
          { text: 'Moorland (HMP & YOI)' },
        ],
        [
          { text: '10/09/2023' },
          { text: '£6.00', format: 'numeric' },
          { text: '', format: 'numeric' },
          { text: '£11.00', format: 'numeric' },
          { text: 'Another Payment from 10/09/2023' },
          { text: 'Moorland (HMP & YOI)' },
        ],
        [
          { text: '09/09/2023' },
          { text: '£5.00', format: 'numeric' },
          { text: '', format: 'numeric' },
          { text: '£5.00', format: 'numeric' },
          { text: 'A Payment from 09/09/2023' },
          { text: 'Moorland (HMP & YOI)' },
        ],
      ],
      pendingTransactions: [],
    })
  })
})
