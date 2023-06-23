import { Prisoner } from '../../interfaces/prisoner'

export interface PrisonerSearchClient {
  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner>
}
