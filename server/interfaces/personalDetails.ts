export type PersonalDetail = {
  key: {
    text: string
  }
  value: {
    text: string | number
  }
}

export type PersonalDetails = {
  personalDetailsMain: {
    preferredName: string
    dateOfBirth: string
    age: string
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
