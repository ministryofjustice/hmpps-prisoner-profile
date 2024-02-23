import { RestrictedPatient } from '../../interfaces/restrictedPatientApi/restrictedPatient'

export interface RestrictedPatientApiClient {
  getRestrictedPatient(prisonerNumber: string): Promise<RestrictedPatient>
}
