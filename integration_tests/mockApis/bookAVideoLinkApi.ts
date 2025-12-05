import { stubFor } from './wiremock'
import type ReferenceCode from '../../server/data/interfaces/bookAVideoLinkApi/ReferenceCode'
import Court, { type ProbationTeam } from '../../server/data/interfaces/bookAVideoLinkApi/Court'
import CreateVideoBookingRequest, {
  type VideoBookingSearchRequest,
  type VideoLinkBooking,
} from '../../server/data/interfaces/bookAVideoLinkApi/VideoLinkBooking'
import { courtHearingTypes, probationMeetingTypes } from '../../server/data/localMockData/courtHearingsMock'
import { courtLocationsMock, probationTeamsMock } from '../../server/data/localMockData/courtLocationsMock'

export default {
  stubBookAVideoLinkBooking: ({
    searchRequest,
    response,
  }: {
    searchRequest: VideoBookingSearchRequest
    response: VideoLinkBooking
  }) =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: '/bookavideolink/video-link-booking/search',
        bodyPatterns: [{ equalToJson: searchRequest }],
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),

  stubBookAVideoLinkCreateBooking: ({
    createRequest,
    response = 1,
  }: {
    createRequest: CreateVideoBookingRequest
    response?: number
  }) =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: '/bookavideolink/video-link-booking',
        bodyPatterns: [{ equalToJson: createRequest }],
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),

  stubBookAVideoLinkProbationTeams: (response?: ProbationTeam[]) =>
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
        jsonBody: response ?? probationTeamsMock,
      },
    }),

  stubBookAVideoLinkCourts: (response?: Court[]) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/bookavideolink/courts',
        queryParameters: { enabledOnly: { equalTo: 'false' } },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response ?? courtLocationsMock,
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
