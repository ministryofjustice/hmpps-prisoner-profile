import Nominal from '../manageSocCasesApi/Nominal'

export interface PathfinderApiClient {
  getNominal(offenderNumber: string): Promise<Nominal | null>
}
