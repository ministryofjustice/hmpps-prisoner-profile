import { Pom } from '../../interfaces/pom'

export default interface AllocationManagerClient {
  getPomByOffenderNo(prisonerNumber: string): Promise<Pom>
}
