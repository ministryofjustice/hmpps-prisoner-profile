import Pom from './Pom'

export default interface AllocationManagerClient {
  getPomByOffenderNo(prisonerNumber: string): Promise<Pom>
}
