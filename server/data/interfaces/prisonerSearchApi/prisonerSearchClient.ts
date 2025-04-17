import Prisoner from './Prisoner'

export interface PrisonerSearchClient {
  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner>
}
