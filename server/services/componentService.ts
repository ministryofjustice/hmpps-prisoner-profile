import { RestClientBuilder } from '../data'
import { ComponentApiClient, ComponentsApiResponse } from '../data/interfaces/componentApiClient'
import AvailableComponent from '../data/interfaces/AvailableComponent'

export default class ComponentService {
  constructor(private readonly componentApiClientBuilder: RestClientBuilder<ComponentApiClient>) {}

  async getComponents<T extends AvailableComponent[]>(
    components: T,
    userToken: string,
    useLatest = false,
  ): Promise<ComponentsApiResponse<T>> {
    return this.componentApiClientBuilder(userToken).getComponents(components, userToken, useLatest)
  }
}
