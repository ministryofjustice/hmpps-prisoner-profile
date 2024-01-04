import { ComplexityOfNeed } from '../../interfaces/complexityApi/complexityOfNeed'

export interface ComplexityApiClient {
  getComplexityOfNeed(prisonerNumber: string): Promise<ComplexityOfNeed>
}
