import { isAfter } from 'date-fns'
import VisitWithVisitors, { VisitDetails } from '../data/interfaces/prisonApi/VisitWithVisitors'
import { ageAsString, formatDate, timeFormat } from '../utils/dateHelpers'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'

interface MapppedVisitWithVisitors {
  type: string
  dateAndTime: string
  status: string
  isBooked: boolean
  prison: string
  visitors: string[]
}

const visitType = (type: VisitDetails['visitType']) => {
  switch (type) {
    case 'OFFI':
      return 'Official visit'
    case 'SCON':
      return 'Social visit'
    default:
      return ''
  }
}

const visitReasonsToStatus = (details: VisitDetails): string => {
  const { completionStatus, completionStatusDescription, cancelReasonDescription, searchTypeDescription, startTime } =
    details
  switch (completionStatus) {
    case 'CANC':
      return `Cancelled: ${cancelReasonDescription}`
    case 'SCH': {
      if (isAfter(new Date(startTime), new Date())) return 'Scheduled'
      return searchTypeDescription || 'Not entered'
    }
    default:
      return `${completionStatusDescription}: ${searchTypeDescription}`
  }
}

export default (visits: VisitWithVisitors[]): MapppedVisitWithVisitors[] => {
  return visits.map(v => {
    return {
      type: visitType(v.visitDetails.visitType),
      dateAndTime: `${formatDate(v.visitDetails.startTime, 'short')} at ${timeFormat(v.visitDetails.startTime)} to ${timeFormat(v.visitDetails.endTime)}`,
      status: visitReasonsToStatus(v.visitDetails),
      isBooked: isAfter(new Date(v.visitDetails.startTime), new Date()) && v.visitDetails.eventStatus === 'SCH',
      prison: v.visitDetails.prison || 'Not entered',
      visitors: v.visitors.map(
        ({ firstName, lastName, relationship, dateOfBirth }) =>
          `${formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })} (${relationship} ${ageAsString(dateOfBirth)})`,
      ),
    }
  })
}
