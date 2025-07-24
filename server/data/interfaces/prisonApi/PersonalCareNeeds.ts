export default interface PersonalCareNeeds {
  offenderNo: string
  personalCareNeeds: PersonalCareNeed[]
}

export interface PersonalCareNeed {
  personalCareNeedId: number
  problemType: string
  problemCode: string
  problemStatus: string
  problemDescription: string
  commentText: string
  startDate: string
  endDate?: string
}

export enum HealthDomainReferenceCode {
  XRayBodyScan = 'BSCAN',
}
