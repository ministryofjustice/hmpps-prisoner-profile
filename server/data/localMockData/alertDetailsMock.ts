import { Alert } from '../interfaces/alertsApi/Alert'

export const alertDetailsMock: Alert = {
  alertUuid: '7',
  prisonNumber: 'AA1234A',
  alertCode: {
    alertTypeCode: 'X',
    alertTypeDescription: 'Security',
    code: 'XA',
    description: 'Arsonist',
  },
  description: 'Set fire to his cell while in a double cell',
  activeFrom: '2011-08-22',
  createdAt: '2011-08-22T10:41:00',
  createdByDisplayName: 'James T Kirk',
  isActive: true,
}

export const alertDetailsExpiresMock: Alert = {
  alertUuid: '7',
  prisonNumber: 'AA1234A',
  alertCode: {
    alertTypeCode: 'X',
    alertTypeDescription: 'Security',
    code: 'XA',
    description: 'Arsonist',
  },
  description: 'Set fire to his cell while in a double cell',
  activeFrom: '2011-08-22',
  activeTo: '2199-08-23',
  createdAt: '2011-08-22T10:41:00',
  createdByDisplayName: 'James T Kirk',
  lastModifiedAt: '2020-05-14T15:21:12',
  lastModifiedByDisplayName: 'Luke Skywalker',
  activeToLastSetAt: '2020-05-14T15:21:12',
  activeToLastSetByDisplayName: 'Luke Skywalker',
  isActive: true,
}

export const alertDetailsCreatedMock: Alert = {
  alertUuid: '7',
  prisonNumber: 'AA1234A',
  alertCode: {
    alertTypeCode: 'X',
    alertTypeDescription: 'Security',
    code: 'XA',
    description: 'Arsonist',
  },
  description: 'Set fire to his cell while in a double cell',
  activeFrom: '2011-08-22',
  createdAt: '2011-08-22T10:41:00',
  createdByDisplayName: 'James T Kirk',
  lastModifiedByDisplayName: undefined,
  isActive: true,
}

export const alertDetailsCreatedViaMapperMock: Alert = {
  alertUuid: '7',
  alertCode: {
    alertTypeCode: 'X',
    alertTypeDescription: 'Security',
    code: 'XA',
    description: 'Arsonist',
  },
  description: 'Set fire to his cell while in a double cell',
  activeFrom: '2011-08-22',
  activeTo: undefined,
  createdAt: '2011-08-22',
  createdByDisplayName: 'James T Kirk',
  lastModifiedAt: undefined,
  lastModifiedByDisplayName: undefined,
  isActive: true,
}
