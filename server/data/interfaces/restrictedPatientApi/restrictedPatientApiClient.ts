import RestrictedPatient from './RestrictedPatient'

export interface RestrictedPatientApiClient {
  getRestrictedPatient(prisonerNumber: string): Promise<RestrictedPatient>
}
