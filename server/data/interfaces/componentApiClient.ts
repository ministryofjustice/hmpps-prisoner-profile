import Component from './component'
import AvailableComponent from './AvailableComponent'

export interface ComponentApiClient {
  getComponents<T extends AvailableComponent[]>(component: T, userToken: string): Promise<Record<T[number], Component>>
}
