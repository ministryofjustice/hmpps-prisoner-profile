import { AgentConfig, RestClient as HmppsRestClient, SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import CircuitBreaker from 'opossum'
import RestClient, { circuitBreakerBuilder, CustomApiConfig, Request } from './restClient'
import appConfig from '../config'

// A lightweight test to ensure that the circuit breaker is working with the feature toggle.
// Does not need to test thoroughly since the library will have that.
// Client is built per request, but a 'global' circuit breaker is passed in.

class TestClient extends RestClient {
  constructor(config: CustomApiConfig, circuitBreaker: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('test-client', config, 'token', circuitBreaker)
  }
}

const defaultVolumeThreshold = appConfig.defaultCircuitBreakerOptions.volumeThreshold
const customVolumeThreshold = 2

const testClientConfig: CustomApiConfig = {
  url: 'http://something',
  timeout: { response: 10000, deadline: 10000 },
  agent: new AgentConfig(10000),
}

const customTestClientConfig: CustomApiConfig = {
  url: 'http://something',
  timeout: { response: 10000, deadline: 10000 },
  agent: new AgentConfig(10000),
  circuitBreakerOptions: {
    volumeThreshold: customVolumeThreshold,
  },
}

const testClientBuilder = (
  circuitBreaker: CircuitBreaker<[Request<unknown, unknown>, string], unknown> | null = null,
  config: CustomApiConfig = testClientConfig,
): TestClient => new TestClient(config, circuitBreaker)

const superGet = jest.fn()
HmppsRestClient.prototype.get = superGet

async function simulateFailures(
  circuitBreaker: CircuitBreaker<[Request<unknown, unknown>, string], unknown> | null = null,
  count = defaultVolumeThreshold,
  error = new Error('failed call') as SanitisedError,
) {
  superGet.mockImplementation(() => Promise.reject(error))

  const promises = Array.from({ length: count }, () =>
    testClientBuilder(circuitBreaker).get({ path: '/test' }, 'token'),
  )

  const results = await Promise.allSettled(promises)
  results.forEach(r => expect(r.status).toBe('rejected'))
}

describe('RestClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses the provided circuit breaker', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = true

    const circuitToBreak = circuitBreakerBuilder('test', testClientConfig)
    const circuitNotToBreak = circuitBreakerBuilder('test', testClientConfig)

    await simulateFailures(circuitToBreak)
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold)

    superGet.mockResolvedValue('success')
    await expect(testClientBuilder(circuitToBreak).get({ path: '/test' }, 'token')).rejects.toThrow()
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold)

    await expect(testClientBuilder(circuitNotToBreak).get({ path: '/test' }, 'token')).resolves.toBe('success')
  })

  it('uses the provided circuit breaker with custom config', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = true

    const circuitToBreak = circuitBreakerBuilder('test', customTestClientConfig)

    await simulateFailures(circuitToBreak, customVolumeThreshold)
    expect(superGet).toHaveBeenCalledTimes(customVolumeThreshold)

    superGet.mockResolvedValue('success')
    await expect(testClientBuilder(circuitToBreak).get({ path: '/test' }, 'token')).rejects.toThrow()
    expect(superGet).toHaveBeenCalledTimes(customVolumeThreshold)
  })

  it('404 errors do not trip the circuit breaker', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = true

    const circuitNotToBreak = circuitBreakerBuilder('test', testClientConfig)

    const notFoundError = { responseStatus: 404 } as SanitisedError
    await simulateFailures(circuitNotToBreak, defaultVolumeThreshold, notFoundError)
    await expect(testClientBuilder(circuitNotToBreak).get({ path: '/test' }, 'token')).rejects.toBe(notFoundError)

    superGet.mockResolvedValue('success')
    await expect(testClientBuilder(circuitNotToBreak).get({ path: '/test' }, 'token')).resolves.toBe('success')
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold + 2)
  })

  it('does not use the circuit breaker when featureToggle is false or a breaker is not provided', async () => {
    appConfig.featureToggles.circuitBreakerEnabled = false

    const unusedCircuitbreaker = circuitBreakerBuilder('test', testClientConfig)
    await simulateFailures(unusedCircuitbreaker)
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold)

    superGet.mockResolvedValue('success')
    await expect(testClientBuilder(unusedCircuitbreaker).get({ path: '/test' }, 'token')).resolves.toBe('success')
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold + 1)

    jest.clearAllMocks()

    appConfig.featureToggles.circuitBreakerEnabled = true

    await simulateFailures()
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold)

    superGet.mockResolvedValue('success')
    await expect(testClientBuilder().get({ path: '/test' }, 'token')).resolves.toBe('success')
    expect(superGet).toHaveBeenCalledTimes(defaultVolumeThreshold + 1)
  })
})
