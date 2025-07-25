import { IdentityNumber } from '../../../services/interfaces/personalPageService/PersonalPage'
import { IdentifierMappings } from '../../constants/identifierMappings'
import { OffenderIdentifierType } from './OffenderIdentifierType'
import { sortByDateTime } from '../../../utils/utils'

export const getOffenderIdentifierValue = (
  type: OffenderIdentifierType,
  array: OffenderIdentifier[],
): IdentityNumber[] => {
  return Array.isArray(array) && array.length
    ? array
        .filter(item => item.type === type)
        // Sort by created date DESC
        .sort((a, b) => sortByDateTime(b.whenCreated, a.whenCreated))
        .map(item => ({
          offenderId: item.offenderId,
          sequenceId: item.offenderIdSeq,
          value: item.value,
          comment: item.issuedAuthorityText,
          editPageUrl:
            Object.values(IdentifierMappings).find(it => it.type === item.type)?.editPageUrl || 'identity-number',
        }))
    : []
}

export default interface OffenderIdentifier {
  type: string
  value: string
  offenderId: number
  offenderIdSeq: number
  offenderNo?: string
  bookingId?: number
  issuedAuthorityText?: string
  issuedDate?: string
  caseloadType?: string
  whenCreated?: string
}
