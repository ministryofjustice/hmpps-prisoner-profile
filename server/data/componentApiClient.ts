import RestClient from './restClient'
import config from '../config'
import AvailableComponent from './interfaces/componentApi/AvailableComponent'
import ComponentApiClient, { ComponentsApiResponse } from './interfaces/componentApi/componentApiClient'

export default class ComponentApiRestClient implements ComponentApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Component API', config.apis.frontendComponents, token)
  }

  getComponents<T extends AvailableComponent[]>(
    components: T,
    userToken: string,
    useLatest: boolean,
  ): Promise<ComponentsApiResponse<T>> {
    const useLatestHeader = useLatest ? { 'x-use-latest-features': 'true' } : {}
    return this.restClient.get<ComponentsApiResponse<T>>({
      path: `/components`,
      query: `component=${components.join('&component=')}`,
      headers: { 'x-user-token': userToken, ...useLatestHeader },
    })
  }
}
