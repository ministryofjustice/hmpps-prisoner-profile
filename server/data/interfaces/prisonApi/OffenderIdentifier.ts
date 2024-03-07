export const getOffenderIdentifierValue = (type: OffenderIdentifierType, array: OffenderIdentifier[]): string => {
  const value = Array.isArray(array) && array.length ? array.find(item => item.type === type) : null

  return value && value.value
}
export default interface OffenderIdentifier {
  type: string
  value: string
  offenderNo?: string
  bookingId?: number
  issuedAuthorityText?: string
  issuedDate?: string
  caseloadType?: string
  whenCreated?: string
}

// eslint-disable-next-line no-shadow
export enum OffenderIdentifierType {
  HomeOfficeReferenceNumber = 'HOREF',
  NationalInsuranceNumber = 'NINO',
  DrivingLicenseNumber = 'DL',
}
