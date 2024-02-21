import { RestrictedPatient } from '../../../interfaces/restrictedPatientApi/restrictedPatient'

export const restrictedPatientMock: RestrictedPatient = {
  prisonerNumber: 'ABC123',
  dischargeTime: '2023-01-01',
  supportingPrison: {
    agencyId: 'LEI',
    active: true,
  },
}
