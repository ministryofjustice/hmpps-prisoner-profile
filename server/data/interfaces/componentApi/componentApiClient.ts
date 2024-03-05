import Component, { ComponentsMeta } from './Component'
import AvailableComponent from './AvailableComponent'

export type ComponentsApiResponse<T extends AvailableComponent[]> = Record<T[number], Component> & {
  meta: ComponentsMeta[T[number]]
}
export default interface ComponentApiClient {
  getComponents<T extends AvailableComponent[]>(
    component: T,
    userToken: string,
    useLatest: boolean,
  ): Promise<ComponentsApiResponse<T>>
}
