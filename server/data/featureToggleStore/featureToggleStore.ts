export default interface FeatureToggleStore {
  setToggle(prisonId: string, featureToggle: string, status: boolean, durationHours?: number): Promise<void>
  getToggle(prisonId: string, featureToggle: string): Promise<boolean>
}
