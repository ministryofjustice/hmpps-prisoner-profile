import { stubFor } from './wiremock'
import type ReferenceCode from '../../server/data/interfaces/bookAVideoLinkApi/ReferenceCode'
import { courtHearingTypes, probationMeetingTypes } from '../../server/data/localMockData/courtHearingsMock'
import { probationTeamsMock } from '../../server/data/localMockData/courtLocationsMock'

export default {
  stubBookAVideoLinkProbationTeams: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/bookavideolink/probation-teams',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: probationTeamsMock,
      },
    }),

  stubBookAVideoLinkReferenceCodes: ({
    group,
    response,
  }: {
    group: 'COURT_HEARING_TYPE' | 'PROBATION_MEETING_TYPE'
    response?: ReferenceCode[]
  }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/bookavideolink/reference-codes/group/${group}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response ?? (group === 'COURT_HEARING_TYPE' ? courtHearingTypes : probationMeetingTypes),
      },
    }),

  stubBookAVideoLinkPing: (httpStatus: number) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/bookavideolink/health/ping',
      },
      response: {
        status: httpStatus,
      },
    }),
}
