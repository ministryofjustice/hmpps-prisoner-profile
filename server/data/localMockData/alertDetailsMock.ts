import PrisonApiAlert from '../interfaces/prisonApi/PrisonApiAlert'
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

export const alertDetailsCreatedMock: Alert = {
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

export const prisonApiAlertDetailsMock: PrisonApiAlert = {
  alertId: '7',
  alertType: 'X',
  alertTypeDescription: 'Security',
  alertCode: 'XA',
  alertCodeDescription: 'Arsonist',
  comment: 'Set fire to his cell while in a double cell',
  dateCreated: '2011-08-22',
  expired: false,
  active: true,
  addedByFirstName: 'JAMES T',
  addedByLastName: 'KIRK',
}

export const alertDetailsExpiresMock: PrisonApiAlert = {
  alertId: '7',
  alertType: 'X',
  alertTypeDescription: 'Security',
  alertCode: 'XA',
  alertCodeDescription: 'Arsonist',
  comment: 'Set fire to his cell while in a double cell',
  dateCreated: '2011-08-22',
  dateExpires: '2199-08-23',
  modifiedDateTime: '2020-05-14T15:21:12.530864',
  expired: false,
  active: true,
  addedByFirstName: 'JAMES T',
  addedByLastName: 'KIRK',
  expiredByFirstName: 'LUKE',
  expiredByLastName: 'SKYWALKER',
}
