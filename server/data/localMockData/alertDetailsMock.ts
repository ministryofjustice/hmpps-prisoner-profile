import { Alert } from '../../interfaces/prisonApi/alert'

export const alertDetailsMock: Alert = {
  alertId: 7,
  alertType: 'X',
  alertTypeDescription: 'Security',
  alertCode: 'XA',
  alertCodeDescription: 'Arsonist',
  comment: 'Set fire to his cell while in a double cell',
  dateCreated: '2011-08-22',
  modifiedDateTime: '2020-05-14T15:21:12.530864',
  expired: false,
  active: true,
  addedByFirstName: 'JAMES T',
  addedByLastName: 'KIRK',
}

export const alertDetailsExpiresMock: Alert = {
  alertId: 7,
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
