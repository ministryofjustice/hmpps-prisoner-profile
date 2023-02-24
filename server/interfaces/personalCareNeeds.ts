export interface PersonalCareNeeds {
  offenderNo: string
  personalCareNeeds: PersonalCareNeed[]
}

export interface PersonalCareNeed {
  problemType: string
  problemCode: string
  problemStatus: string
  problemDescription: string
  commentText: string
  startDate: string
  endDate?: string
}
