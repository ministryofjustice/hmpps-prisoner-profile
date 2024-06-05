import FeatureToggleStore from '../data/featureToggleStore/featureToggleStore'

export default class FeatureToggleService {
  constructor(private readonly featureToggleStore: FeatureToggleStore) {}

  public async getFeatureToggle(prisonId: string, featureToggle: string): Promise<boolean> {
    if (!prisonId) return false

    return this.featureToggleStore.getToggle(prisonId, featureToggle)
  }

  public async setFeatureToggle(prisonId: string, featureToggle: string, status: boolean) {
    await this.featureToggleStore.setToggle(prisonId, featureToggle, status)
  }
}
