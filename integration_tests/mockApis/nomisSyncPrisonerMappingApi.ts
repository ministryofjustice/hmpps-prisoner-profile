import { stubFor } from './wiremock'
import type NomisSyncLocation from '../../server/data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncLocation'

export default {
  stubNomisSyncPrisonerMappingApiPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/nomissyncprisonermapping/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),

  stubGetMappingUsingNomisLocationId: ({
    nomisLocationId,
    dpsLocationId,
  }: {
    nomisLocationId: number
    dpsLocationId?: string
  }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/nomissyncprisonermapping/api/locations/nomis/${nomisLocationId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          dpsLocationId: dpsLocationId ?? 'abcde',
          nomisLocationId,
        } satisfies NomisSyncLocation,
      },
    }),

  stubGetMappingUsingDpsLocationId: ({
    dpsLocationId,
    nomisLocationId,
  }: {
    dpsLocationId: string
    nomisLocationId?: number
  }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/nomissyncprisonermapping/api/locations/dps/${dpsLocationId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          dpsLocationId,
          nomisLocationId: nomisLocationId ?? 25762,
        } satisfies NomisSyncLocation,
      },
    }),
}
