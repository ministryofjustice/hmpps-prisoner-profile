import HeaderFooterSharedData from '@ministryofjustice/hmpps-connect-dps-components/dist/types/HeaderFooterSharedData'

export const isServiceEnabledForNavigation = (
  serviceId: string,
  componentsMeta: HeaderFooterSharedData | undefined,
): boolean => {
  return !!componentsMeta?.services?.find(service => service.id === serviceId && service.navEnabled)
}

export const isServiceEnabled = (
  serviceId: string,
  componentsSharedData: HeaderFooterSharedData | undefined,
): boolean => {
  return !!componentsSharedData?.services?.find(service => service.id === serviceId)
}

export default isServiceEnabledForNavigation
