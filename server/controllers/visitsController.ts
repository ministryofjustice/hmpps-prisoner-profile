import { RequestHandler } from 'express'
import { format, isAfter, isBefore, startOfDay } from 'date-fns'
import { VisitsService } from '../services/visitsService'
import { VisitsListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import ReferenceCode from '../data/interfaces/prisonApi/ReferenceCode'
import { compareStrings, generateListMetadata, hasLength } from '../utils/utils'
import PrisonDetails from '../data/interfaces/prisonApi/PrisonDetails'
import { VisitType } from '../data/interfaces/prisonApi/VisitWithVisitors'
import { parseDate } from '../utils/dateHelpers'

export const VISIT_TYPES = [
  { value: 'SCON', text: 'Social' },
  { value: 'OFFI', text: 'Official' },
]

const sortByListSequenceThenDescription = (left: ReferenceCode, right: ReferenceCode): number => {
  const listSeqSort = left.listSeq - right.listSeq
  if (listSeqSort !== 0) return listSeqSort
  return compareStrings(left.description, right.description)
}

const prisonsToDropdown = (prisons: PrisonDetails[]) =>
  hasLength(prisons) ? prisons.map(({ prisonId, prison }) => ({ value: prisonId, text: prison })) : []

/*
  We show the status as one dropdown in the frontend however the API requires querying by
  the visit status or the cancellation reason - this and calculateDateAndStatusFilter
  work together to allow that to appear as one dropdown despite being separate filters
*/
const visitReasonsToDropdown = (cancellationReasons: ReferenceCode[], completionReasons: ReferenceCode[]) =>
  cancellationReasons
    .sort(sortByListSequenceThenDescription)
    .map(type => ({ value: `CANC-${type.code}`, text: `Cancelled: ${type.description}` }))
    .concat(
      completionReasons
        .sort(sortByListSequenceThenDescription)
        .filter(reason => reason.code !== 'CANC' && reason.code !== 'SCH')
        .map(type => ({ value: type.code, text: type.description })),
    )
    .concat([
      { value: 'SCH', text: 'Scheduled' },
      { value: 'EXP', text: 'Not entered' },
    ])

const calculateDateAndStatusFilter = (status: string, fromDate: string, toDate: string) => {
  const fromAsDate = fromDate ? parseDate(fromDate) : undefined
  const toAsDate = toDate ? parseDate(toDate) : undefined

  const now = startOfDay(new Date())
  if (status === 'EXP') return { visitStatus: 'SCH', fromAsDate, toAsDate: isBefore(toAsDate, now) ? toAsDate : now }
  if (status === 'SCH') return { visitStatus: 'SCH', fromAsDate: isAfter(fromAsDate, now) ? fromAsDate : now, toAsDate }
  const splitStatus = status?.split('-')
  const visitStatus = splitStatus?.shift()
  const cancellationReason = splitStatus?.shift()
  return { visitStatus, cancellationReason, fromAsDate, toAsDate }
}

export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  public visitsDetails(): RequestHandler {
    return async (req, res) => {
      const queryParams: VisitsListQueryParams = {}
      const { clientToken, prisonerData } = req.middleware

      const visitStatusString = req.query.visitStatus as string
      const fromDateString = req.query.fromDate as string
      const toDateString = req.query.toDate as string

      const { visitStatus, cancellationReason, fromAsDate, toAsDate } = calculateDateAndStatusFilter(
        visitStatusString,
        fromDateString,
        toDateString,
      )

      if (req.query.page) queryParams.page = +req.query.page
      if (req.query.visitType) queryParams.visitType = req.query.visitType as string
      if (req.query.prisonId) queryParams.prisonId = req.query.prisonId as string

      if (visitStatus) queryParams.visitStatus = visitStatus
      if (cancellationReason) queryParams.cancellationReason = cancellationReason
      if (fromAsDate) queryParams.fromDate = format(fromAsDate, 'yyyy-MM-dd')
      if (toAsDate) queryParams.toDate = format(toAsDate, 'yyyy-MM-dd')

      const { completionReasons, cancellationReasons, prisons, visitsWithPaginationInfo } =
        await this.visitsService.getVisits(clientToken, prisonerData, queryParams)

      return res.render('pages/visitsDetails', {
        pageTitle: 'Visits details',
        statuses: visitReasonsToDropdown(cancellationReasons, completionReasons),
        visitTypes: [
          {
            value: VisitType.Social,
            text: 'Social',
          },
          {
            value: VisitType.Official,
            text: 'Official',
          },
        ],
        prisons: prisonsToDropdown(prisons),
        listMetadata: generateListMetadata(
          visitsWithPaginationInfo,
          { ...queryParams, fromDate: fromDateString, toDate: toDateString, page: undefined }, // Remove page param before generating metadata as this value come from API
          'result',
        ),
        visitStatusSelected: visitStatusString || undefined,
        visits: visitsWithPaginationInfo.content.map(visit => ({
          ...visit,
          visitors: this.visitsService.sortVisitors(visit.visitors),
        })),
        hasNoVisitsForQuery: !hasLength(visitsWithPaginationInfo.content) && hasLength(Object.keys(queryParams)),
        hasVisits: hasLength(visitsWithPaginationInfo.content),
      })
    }
  }
}
