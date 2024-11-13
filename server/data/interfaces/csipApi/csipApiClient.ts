import CurrentCsipDetail from './csip'

export interface CsipApiClient {
  getCurrentCsip(prisonerNumber: string): Promise<CurrentCsipDetail>
}
