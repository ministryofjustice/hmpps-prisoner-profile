import RestClient from './restClient'
import Component from './interfaces/component'
import { ComponentApiClient } from './interfaces/componentApiClient'
import AvailableComponent from './interfaces/AvailableComponent'

export default class ComponentApiRestClient implements ComponentApiClient {
  constructor(private restClient: RestClient) {}

  getComponents<T extends AvailableComponent[]>(
    components: T,
    userToken: string,
  ): Promise<Record<T[number], Component>> {
    return this.restClient.get<Record<T[number], Component>>({
      path: `/components`,
      query: `component=${components.join('&component=')}`,
      headers: { 'x-user-token': userToken },
    })
  }
}
