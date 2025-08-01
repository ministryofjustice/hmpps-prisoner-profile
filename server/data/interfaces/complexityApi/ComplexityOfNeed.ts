export default interface ComplexityOfNeed {
  offenderNo: string
  level: ComplexityLevel
  sourceUser: string
  sourceSystem: string
  notes: string
  createdTimeStamp: string
  active: boolean
}

export enum ComplexityLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}
