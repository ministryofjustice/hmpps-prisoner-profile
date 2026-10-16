import { PrisonerPermissions, PrisonerPropertyPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import propertySummaryToMiniSummary from './propertySummaryToMiniSummary'
import { Result } from '../../utils/result/result'
import config from '../../config'
import mockPermissions from '../../../tests/mocks/mockPermissions'
import { propertySummaryMock } from '../../data/localMockData/prisonerPropertySummaryMock'

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')

const prisonerNumber = 'A1234BC'
const permissions = {} as PrisonerPermissions

describe('propertySummaryToMiniSummary', () => {
  beforeEach(() => {
    mockPermissions({ [PrisonerPropertyPermission.read_property_details]: true })
  })

  it('should return a mini summary object for a successful property summary', () => {
    const miniSummary = propertySummaryToMiniSummary(Result.fulfilled(propertySummaryMock), prisonerNumber, permissions)

    expect(miniSummary).toEqual({
      heading: 'Property',
      id: 'property',
      topLabel: 'Containers in Moorland (HMP & YOI)',
      topContent: 5,
      topClass: 'big',
      items: [
        { text: 'Due for transfer in: 1' },
        { text: 'Due for transfer out: 2' },
        expect.objectContaining({
          text: '2 disposals overdue',
          showWarningIcon: true,
          classes: 'hmpps-red-text govuk-!-font-weight-bold',
        }),
        expect.objectContaining({
          text: '1 return overdue',
          showWarningIcon: true,
          classes: 'hmpps-red-text govuk-!-font-weight-bold',
        }),
      ],
      linkLabel: 'Property',
      linkHref: `${config.serviceUrls.prisonerProperty}/prisoner/${prisonerNumber}`,
    })
  })

  it('should not provide a link when the property details permission is not granted', () => {
    mockPermissions({ [PrisonerPropertyPermission.read_property_details]: false })

    const miniSummary = propertySummaryToMiniSummary(Result.fulfilled(propertySummaryMock), prisonerNumber, permissions)

    expect(miniSummary).toEqual(expect.objectContaining({ linkHref: undefined }))
  })

  it('should return a mini summary with an unavailable message when the property summary is rejected', () => {
    const miniSummary = propertySummaryToMiniSummary(Result.rejected(new Error('error')), 'A1234BC', permissions)

    expect(miniSummary).toEqual({
      heading: 'Property',
      id: 'property',
    })
  })
})
