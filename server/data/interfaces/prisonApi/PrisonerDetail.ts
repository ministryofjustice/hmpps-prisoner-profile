export default interface PrisonerDetail {
  offenderNo: string
  title?: string
  suffix?: string
  firstName: string
  middleNames?: string
  lastName: string
  dateOfBirth: string
  gender: string
  sexCode: string
  nationalities?: string
  currentlyInPrison: string
  latestBookingId?: number
  latestLocationId?: string
  latestLocation?: string
  internalLocation?: string
  pncNumber?: string
  croNumber?: string
  ethnicity?: string
  ethnicityCode?: string
  birthCountry?: string
  religion?: string
  religionCode?: string
  convictedStatus?: 'Convicted' | 'Remand'
  legalStatus?:
    | 'RECALL'
    | 'DEAD'
    | 'INDETERMINATE_SENTENCE'
    | 'SENTENCED'
    | 'CONVICTED_UNSENTENCED'
    | 'CIVIL_PRISONER'
    | 'IMMIGRATION_DETAINEE'
    | 'REMAND'
    | 'UNKNOWN'
    | 'OTHER'
  imprisonmentStatus?: string
  imprisonmentStatusDesc?: string
  receptionDate?: string
  maritalStatus?: string
  currentWorkingFirstName: string
  currentWorkingLastName: string
  currentWorkingBirthDate: string
}
