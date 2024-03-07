import Nominal from './Nominal'

export interface ManageSocCasesApiClient {
  getNominal(offenderNumber: string): Promise<Nominal | null>
}
