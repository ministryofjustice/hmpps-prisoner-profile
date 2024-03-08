import { HeaderFooterMeta } from '../data/interfaces/componentApi/Component'

export default (serviceId: string, componentsMeta: HeaderFooterMeta | undefined): boolean => {
  return !!componentsMeta?.services?.find(service => service.id === serviceId)
}
