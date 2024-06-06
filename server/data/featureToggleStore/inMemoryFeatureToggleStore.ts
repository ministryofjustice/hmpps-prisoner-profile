import FeatureToggleStore from './featureToggleStore'

export default class InMemoryFeatureToggleStore implements FeatureToggleStore {
  map = new Map<string, { status: boolean; expiry: Date }>()

  public async setToggle(
    prisonId: string,
    featureToggle: string,
    status: boolean,
    durationHours: number,
  ): Promise<void> {
    const key = `featureToggle:${prisonId}:${featureToggle}`
    this.map.set(key, { status, expiry: new Date(Date.now() + durationHours * 1000 * 60 * 60) })
    return Promise.resolve()
  }

  public async getToggle(prisonId: string, featureToggle: string): Promise<boolean> {
    const key = `featureToggle:${prisonId}:${featureToggle}`
    if (!this.map.has(key) || this.map.get(key).expiry.getTime() < Date.now()) {
      return Promise.resolve(false)
    }
    return Promise.resolve(this.map.get(key).status)
  }
}
