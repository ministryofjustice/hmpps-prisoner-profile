import SharedData from '@ministryofjustice/hmpps-connect-dps-components/dist/types/SharedData'

export const isServiceEnabledForNavigation = (serviceId: string, componentsMeta: SharedData | undefined): boolean => {
  return !!componentsMeta?.services?.find(service => service.id === serviceId && service.navEnabled)
}

export const isServiceEnabled = (serviceId: string, componentsSharedData: SharedData | undefined): boolean => {
  return !!componentsSharedData?.services?.find(service => service.id === serviceId)
}

export default isServiceEnabledForNavigation
