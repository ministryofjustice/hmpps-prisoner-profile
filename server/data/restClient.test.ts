import { AgentConfig, RestClient as HmppsRestClient } from '@ministryofjustice/hmpps-rest-client'
import RestClient, { CustomApiConfig } from './restClient'
import appConfig from '../config'

// A lightweight test to ensure that the circuit breaker is working with the feature toggle.
// Does not need to test thoroughly since the library will have that.

class TestClient extends RestClient {
  constructor(config: CustomApiConfig) {
    super('test-client', config, 'token')
  }
}

const defaultVolumeThreshold = appConfig.defaultCircuitBreakerOptions.volumeThreshold

const defaultClient = new TestClient({
  url: 'http://something',
  timeout: { response: 10000, deadline: 10000 },
  agent: new AgentConfig(10000),
})

const customClient = new TestClient({
  url: 'http://something',
  timeout: { response: 10000, deadline: 10000 },
  agent: new AgentConfig(10000),
  circuitBreakerOptions: {
    volumeThreshold: 2,
  },
})

const superGet = jest.fn()
HmppsRestClient.prototype.get = superGet

async function simulateFailures(client: RestClient, count = defaultVolumeThreshold) {
  superGet.mockImplementation(() => Promise.reject(new Error('failed call')))

  const promises = Array.from({ length: count }, () => client.get({ path: '/test' }, 'token'))

  const results = await Promise.allSettled(promises)
  results.forEach(r => expect(r.status).toBe('rejected'))
}

describe('RestClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses the circuit breaker with default values when featureToggle is true', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = true
    await simulateFailures(defaultClient)
    superGet.mockResolvedValue('success but circuit is open')
    await expect(defaultClient.get({ path: '/test' }, 'token')).rejects.toThrow()
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold)
  })

  it('uses the circuit breaker when featureToggle is true and uses custom config', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = true
    await simulateFailures(customClient, 2)
    superGet.mockResolvedValue('success but circuit is open')
    await expect(customClient.get({ path: '/test' }, 'token')).rejects.toThrow()
    expect(superGet).toHaveBeenCalledTimes(2)
  })

  it('does not use the circuit breaker when featureToggle is false', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = false
    await simulateFailures(defaultClient)
    superGet.mockResolvedValue('success')
    await expect(defaultClient.get({ path: '/test' }, 'token')).resolves.toBe('success')
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold + 1)
  })
})
