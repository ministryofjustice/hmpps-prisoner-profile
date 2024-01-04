export interface ComplexityOfNeed {
  offenderNo: string
  level: ComplexityLevel
  sourceUser: string
  sourceSystem: string
  notes: string
  createdTimeStamp: string
  active: boolean
}

// eslint-disable-next-line no-shadow
export enum ComplexityLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}
