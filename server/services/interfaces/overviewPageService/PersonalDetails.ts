export default interface PersonalDetails {
  personalDetailsMain: {
    preferredName: string
    dateOfBirth: string
    age: { years: number; months: number } | null
    nationality: string
    spokenLanguage: string
  }
  personalDetailsSide: {
    ethnicGroup: string
    religionOrBelief: string
    croNumber: string
    pncNumber: string
  }
}
