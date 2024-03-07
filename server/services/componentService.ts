import { RestClientBuilder } from '../data'
import AvailableComponent from '../data/interfaces/componentApi/AvailableComponent'
import ComponentApiClient, { ComponentsApiResponse } from '../data/interfaces/componentApi/componentApiClient'

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
