import { AgentConfig, RestClient as HmppsRestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
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

const defaultClient = (): RestClient =>
  new TestClient({
    url: 'http://something',
    timeout: { response: 10000, deadline: 10000 },
    agent: new AgentConfig(10000),
  })

const customClient = (): RestClient =>
  new TestClient({
    url: 'http://something',
    timeout: { response: 10000, deadline: 10000 },
    agent: new AgentConfig(10000),
    circuitBreakerOptions: {
      volumeThreshold: 2,
    },
  })

const superGet = jest.fn()
HmppsRestClient.prototype.get = superGet

async function simulateFailures(
  client: RestClient,
  count = defaultVolumeThreshold,
  error = new Error('failed call') as SanitisedError,
) {
  superGet.mockImplementation(() => Promise.reject(error))

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
    const client = defaultClient()
    await simulateFailures(client)
    superGet.mockResolvedValue('success but circuit is open')
    await expect(client.get({ path: '/test' }, 'token')).rejects.toThrow()
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold)
  })

  it('uses the circuit breaker when featureToggle is true and uses custom config', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = true
    const client = customClient()
    await simulateFailures(client, 2)
    superGet.mockResolvedValue('success but circuit is open')
    await expect(client.get({ path: '/test' }, 'token')).rejects.toThrow()
    expect(superGet).toHaveBeenCalledTimes(2)
  })

  it('ignores 404 errors and does not trip the circuit breaker', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = true
    const client = defaultClient()

    const notFoundError = { responseStatus: 404 } as SanitisedError
    await simulateFailures(client, defaultVolumeThreshold, notFoundError)

    await expect(client.get({ path: '/test' }, 'token')).rejects.toBe(notFoundError)
    superGet.mockResolvedValue('success')

    await expect(client.get({ path: '/test' }, 'token')).resolves.toBe('success')
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold + 2)
  })

  it('does not use the circuit breaker when featureToggle is false', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = false
    const client = defaultClient()
    await simulateFailures(client)
    superGet.mockResolvedValue('success')
    await expect(client.get({ path: '/test' }, 'token')).resolves.toBe('success')
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold + 1)
  })
})
