import { RestClientBuilder } from '../data'
import { ComponentApiClient } from '../data/interfaces/componentApiClient'
import Component from '../data/interfaces/component'
import AvailableComponent from '../data/interfaces/AvailableComponent'

export default class ComponentService {
  constructor(private readonly componentApiClientBuilder: RestClientBuilder<ComponentApiClient>) {}

  async getComponents<T extends AvailableComponent[]>(
    components: T,
    userToken: string,
  ): Promise<Record<T[number], Component>> {
    return this.componentApiClientBuilder(userToken).getComponents(components, userToken)
  }
}
