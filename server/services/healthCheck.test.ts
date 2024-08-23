import type { HealthCheckCallback, HealthCheckService } from './healthCheck'
import healthCheck from './healthCheck'
import type { ApplicationInfo } from '../applicationInfo'

describe('Healthcheck', () => {
  const testAppInfo: ApplicationInfo = {
    applicationName: 'test',
    buildNumber: '1',
    gitRef: 'long ref',
    gitShortHash: 'short ref',
    branchName: 'main',
  }

  it('Healthcheck reports UP', done => {
    const nonResilientChecks = [successfulCheck('check1'), successfulCheck('check2')]
    const resilientChecks = [successfulCheck('check3'), successfulCheck('check4')]

    const callback: HealthCheckCallback = result => {
      expect(result).toEqual(
        expect.objectContaining({
          status: 'UP',
          components: {
            check1: {
              status: 'UP',
              details: 'some message',
            },
            check2: {
              status: 'UP',
              details: 'some message',
            },
            check3: {
              status: 'UP',
              details: 'some message',
            },
            check4: {
              status: 'UP',
              details: 'some message',
            },
          },
        }),
      )
      done()
    }

    healthCheck(testAppInfo, callback, nonResilientChecks, resilientChecks)
  })

  it('Healthcheck reports DOWN', done => {
    const nonResilientChecks = [successfulCheck('check1'), erroredCheck('check2')]
    const resilientChecks = [successfulCheck('check3'), successfulCheck('check4')]

    const callback: HealthCheckCallback = result => {
      expect(result).toEqual(
        expect.objectContaining({
          status: 'DOWN',
          components: {
            check1: {
              status: 'UP',
              details: 'some message',
            },
            check2: {
              status: 'DOWN',
              details: 'some error',
            },
            check3: {
              status: 'UP',
              details: 'some message',
            },
            check4: {
              status: 'UP',
              details: 'some message',
            },
          },
        }),
      )
      done()
    }

    healthCheck(testAppInfo, callback, nonResilientChecks, resilientChecks)
  })

  it('Healthcheck reports DEGRADED', done => {
    const nonResilientChecks = [successfulCheck('check1'), successfulCheck('check2')]
    const resilientChecks = [successfulCheck('check3'), erroredCheck('check4')]

    const callback: HealthCheckCallback = result => {
      expect(result).toEqual(
        expect.objectContaining({
          status: 'DEGRADED',
          components: {
            check1: {
              status: 'UP',
              details: 'some message',
            },
            check2: {
              status: 'UP',
              details: 'some message',
            },
            check3: {
              status: 'UP',
              details: 'some message',
            },
            check4: {
              status: 'DOWN',
              details: 'some error',
            },
          },
        }),
      )
      done()
    }

    healthCheck(testAppInfo, callback, nonResilientChecks, resilientChecks)
  })
})

function successfulCheck(name: string): HealthCheckService {
  return () =>
    Promise.resolve({
      name: `${name}`,
      status: 'UP',
      message: 'some message',
    })
}

function erroredCheck(name: string): HealthCheckService {
  return () =>
    Promise.resolve({
      name: `${name}`,
      status: 'DOWN',
      message: 'some error',
    })
}
