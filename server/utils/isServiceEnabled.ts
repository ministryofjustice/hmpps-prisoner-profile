import HeaderFooterMeta from '@ministryofjustice/hmpps-connect-dps-components/dist/types/HeaderFooterMeta'

export const isServiceEnabledForNavigation = (
  serviceId: string,
  componentsMeta: HeaderFooterMeta | undefined,
): boolean => {
  return !!componentsMeta?.services?.find(service => service.id === serviceId && service.navEnabled)
}

export const isServiceEnabled = (serviceId: string, componentsMeta: HeaderFooterMeta | undefined): boolean => {
  return !!componentsMeta?.services?.find(service => service.id === serviceId)
}

export default isServiceEnabledForNavigation
