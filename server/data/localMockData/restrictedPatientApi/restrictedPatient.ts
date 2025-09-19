import RestrictedPatient from '../../interfaces/restrictedPatientApi/RestrictedPatient'

export const restrictedPatientMock: RestrictedPatient = {
  prisonerNumber: 'A1234BC',
  dischargeTime: '2023-01-01',
  supportingPrison: {
    agencyId: 'LEI',
    active: true,
  },
}

export default { restrictedPatientMock }
