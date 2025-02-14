import { Alert } from '../../data/interfaces/alertsApi/Alert'
import PagedList from '../../data/interfaces/prisonApi/PagedList'
import { pagedActiveAlertsMock } from '../../data/localMockData/pagedAlertsMock'
import { Result } from '../../utils/result/result'
import { toAlertSummaryData } from './alertMapper'

describe('alertMapper', () => {
  describe('toAlertSummaryData', () => {
    describe('High profile prisoners', () => {
      it('Returns high profile prisoner when they have an active HPI alert', async () => {
        const alertContent = [...pagedActiveAlertsMock.content]
        alertContent.push({
          alertCode: {
            code: 'HPI',
          },
          isActive: true,
        } as Alert)

        async function result(): Promise<PagedList<Alert>> {
          return { ...pagedActiveAlertsMock, content: alertContent }
        }

        const summary = toAlertSummaryData(await Result.wrap(result(), () => {}))
        expect(summary.highPublicInterestPrisoner).toEqual(true)
      })

      it('Returns non-high profile prisoner when they have an inactive HPI alert', async () => {
        const alertContent = [...pagedActiveAlertsMock.content]
        alertContent.push({
          alertCode: {
            code: 'HPI',
          },
          isActive: false,
        } as Alert)

        async function result(): Promise<PagedList<Alert>> {
          return { ...pagedActiveAlertsMock, content: alertContent }
        }

        const summary = toAlertSummaryData(await Result.wrap(result(), () => {}))
        expect(summary.highPublicInterestPrisoner).toEqual(false)
      })

      it('Returns non-high profile prisoner when they have no HPI alert', async () => {
        async function result(): Promise<PagedList<Alert>> {
          return pagedActiveAlertsMock
        }

        const summary = toAlertSummaryData(await Result.wrap(result(), () => {}))
        expect(summary.highPublicInterestPrisoner).toEqual(false)
      })
    })
  })
})
