import ComplexityOfNeed from './ComplexityOfNeed'

export default interface ComplexityApiClient {
  getComplexityOfNeed(prisonerNumber: string): Promise<ComplexityOfNeed | null>
}
