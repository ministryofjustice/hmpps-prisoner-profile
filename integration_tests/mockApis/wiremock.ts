import superagent, { SuperAgentRequest, Response } from 'superagent'

const url = 'http://localhost:9091/__admin'

/**
 * Incomplete definition when creating a new stub mapping
 * https://wiremock.org/docs/standalone/admin-api-reference/#tag/Stub-Mappings/operation/createNewStubMapping
 */
export interface Mapping {
  request?: Partial<
    {
      method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
      queryParameters: Record<string, { equalTo: string } | { matches: string }>
      bodyPatterns: ({ contains: string } | { equalToJson: unknown })[]
    } & ({ url: string } | { urlPath: string } | { urlPathPattern: string } | { urlPattern: string })
  >
  response?: Partial<
    {
      status: number
      headers: Record<string, string>
    } & ({ jsonBody: unknown } | { body: string } | { base64Body: string })
  >
}

const stubFor = (mapping: Mapping): SuperAgentRequest => superagent.post(`${url}/mappings`).send(mapping)

const getMatchingRequests = body => superagent.post(`${url}/requests/find`).send(body)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

export { stubFor, getMatchingRequests, resetStubs }
