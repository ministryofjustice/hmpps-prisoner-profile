import { ComplexityLevel, ComplexityOfNeed } from '../../interfaces/complexityApi/complexityOfNeed'

export const complexityOfNeedHighMock: ComplexityOfNeed = {
  offenderNo: 'G6123VU',
  level: ComplexityLevel.High,
  sourceUser: 'James T Kirk',
  sourceSystem: 'Source System',
  notes: 'Notes',
  createdTimeStamp: '2023-12-01T12:34:56',
  active: true,
}

export const complexityOfNeedLowMock: ComplexityOfNeed = {
  offenderNo: 'G6123VU',
  level: ComplexityLevel.Low,
  sourceUser: 'James T Kirk',
  sourceSystem: 'Source System',
  notes: 'Notes',
  createdTimeStamp: '2023-12-01T12:34:56',
  active: true,
}
