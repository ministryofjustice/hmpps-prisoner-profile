import FeatureToggleStore from './featureToggleStore'
import InMemoryFeatureToggleStore from './inMemoryFeatureToggleStore'

describe('inMemoryFeatureToggleStore', () => {
  let featureToggleStore: FeatureToggleStore

  const prisonId = 'MDI'
  const featureToggle = 'alertsApiEnabled'

  beforeEach(() => {
    featureToggleStore = new InMemoryFeatureToggleStore()
  })

  it('Can store and retrieve feature toggle status', async () => {
    await featureToggleStore.setToggle(prisonId, featureToggle, true, 1)
    expect(await featureToggleStore.getToggle(prisonId, featureToggle)).toBe(true)
  })

  it('Expires feature toggle status', async () => {
    await featureToggleStore.setToggle(prisonId, featureToggle, true, -1)
    expect(await featureToggleStore.getToggle(prisonId, featureToggle)).toBe(false)
  })
})
