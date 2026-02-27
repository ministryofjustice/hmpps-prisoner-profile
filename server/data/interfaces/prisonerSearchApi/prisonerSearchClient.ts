import Prisoner from './Prisoner'

export interface PrisonerSearchClient {
  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner>
  findByNumbers(prisonerNumbers: string[]): Promise<Prisoner[]>
}
