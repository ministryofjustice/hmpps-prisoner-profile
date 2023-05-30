import { Nominal } from '../../interfaces/pathfinderApi/nominal'

export interface PathfinderApiClient {
  getNominal(offenderNumber: string): Promise<Nominal>
}
