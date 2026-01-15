import { PrisonerIncentivesPermission, PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import incentiveSummaryToMiniSummary from './incentiveSummaryToMiniSummary'
import IncentiveSummary from '../../services/interfaces/incentivesService/IncentiveSummary'
import { unavailablePlaceholder } from '../../utils/utils'
import { Result } from '../../utils/result/result'
import mockPermissions from '../../../tests/mocks/mockPermissions'

jest.mock('@ministryofjustice/hmpps-prison-permissions-lib')

const permissions = {} as PrisonerPermissions

describe('incentiveSummaryToMiniSummary', () => {
  beforeEach(() => {
    mockPermissions({ [PrisonerIncentivesPermission.read_incentive_level_history]: true })
  })

  it('should return a mini summary object', () => {
    const incentiveSummary = {
      positiveBehaviourCount: 1,
      negativeBehaviourCount: 2,
      nextReviewDate: '2021-01-01',
      daysOverdue: 1,
    }
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummary(
      Result.fulfilled(incentiveSummary),
      prisonerNumber,
      prisonerDisplayName,
      permissions,
    )
    expect(miniSummary).toEqual({
      heading: 'Incentives',
      label: 'Since last review',
      items: [
        { text: 'Positive behaviours: 1' },
        { text: 'Negative behaviours: 2', classes: 'govuk-!-margin-bottom-3' },
        { text: 'Next review by: 01/01/2021', classes: 'hmpps-secondary-text' },
        { text: '1 day overdue', classes: 'hmpps-red-text govuk-!-font-weight-bold' },
      ],
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
  })

  it('should not provide a link if read_incentive_level_history permission not granted', () => {
    mockPermissions({ [PrisonerIncentivesPermission.read_incentive_level_history]: false })

    const miniSummary = incentiveSummaryToMiniSummary(
      Result.fulfilled({
        positiveBehaviourCount: 1,
        negativeBehaviourCount: 2,
        nextReviewDate: '2021-01-01',
        daysOverdue: 1,
      }),
      'A1234BC',
      'John Doe',
      permissions,
    )

    expect(miniSummary).toEqual(expect.objectContaining({ linkHref: undefined }))
  })

  it('should pluralise the overdue days', () => {
    const incentiveSummary = {
      positiveBehaviourCount: 1,
      negativeBehaviourCount: 2,
      nextReviewDate: '2021-01-01',
      daysOverdue: 3,
    }
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummary(
      Result.fulfilled(incentiveSummary),
      prisonerNumber,
      prisonerDisplayName,
      permissions,
    )
    expect(miniSummary).toEqual({
      heading: 'Incentives',
      label: 'Since last review',
      items: [
        { text: 'Positive behaviours: 1' },
        { text: 'Negative behaviours: 2', classes: 'govuk-!-margin-bottom-3' },
        { text: 'Next review by: 01/01/2021', classes: 'hmpps-secondary-text' },
        { text: '3 days overdue', classes: 'hmpps-red-text govuk-!-font-weight-bold' },
      ],
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
  })

  it('should return a mini summary object with no data message if all values are null', () => {
    const incentiveSummary: IncentiveSummary = {
      positiveBehaviourCount: null,
      negativeBehaviourCount: null,
      nextReviewDate: null,
      daysOverdue: null,
    }
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummary(
      Result.fulfilled(incentiveSummary),
      prisonerNumber,
      prisonerDisplayName,
      permissions,
    )
    expect(miniSummary).toEqual({
      heading: 'Incentives',
      label: 'Since last review',
      items: [{ text: 'John Doe has no incentive level history' }],
      linkLabel: 'Incentive level details',
      linkHref: 'http://localhost:3001/incentive-reviews/prisoner/A1234BC',
    })
  })

  it('should return a mini summary object with error message if incentiveSummary is an error', () => {
    const prisonerNumber = 'A1234BC'
    const prisonerDisplayName = 'John Doe'
    const miniSummary = incentiveSummaryToMiniSummary(
      Result.rejected(new Error('error')),
      prisonerNumber,
      prisonerDisplayName,
      permissions,
    )
    expect(miniSummary).toEqual({
      heading: 'Incentives',
      label: 'Since last review',
      items: [
        {
          text: unavailablePlaceholder,
        },
      ],
    })
  })
})
