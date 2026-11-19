export interface PermissionsApi {
  checkHighProfilePrisonerStatus(prisonerNumber: string): Promise<boolean>
}
