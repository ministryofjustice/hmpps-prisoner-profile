import { Nominal } from '../../interfaces/pathfinderApi/nominal'

export interface ManageSocCasesApiClient {
  getNominal(offenderNumber: string): Promise<Nominal | null>
}
