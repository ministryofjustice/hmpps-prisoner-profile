export type PersonalDetail = {
  key: {
    text: string
  }
  value: {
    text: string | number
  }
}

export type PersonalDetails = {
  personalDetailsMain: PersonalDetail[]
  personalDetailsSide: PersonalDetail[]
}
