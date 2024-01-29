import { HeaderFooterMeta } from '../data/interfaces/component'

export default (serviceId: string, componentsMeta: HeaderFooterMeta | undefined): boolean => {
  return !!componentsMeta?.services?.find(service => service.id === serviceId)
}
