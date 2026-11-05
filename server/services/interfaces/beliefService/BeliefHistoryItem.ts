export interface BeliefHistoryItem {
  current: boolean
  religionCode: string
  religionDescription?: string | null
  changeReasonKnown: boolean
  comments?: string | null
  startDate: string
  endDate?: string | null
  createUserFirstName: string
  createUserLastName: string
  modifyUserFirstName?: string | null
  modifyUserLastName?: string | null
  modifyDate?: string | null
}
