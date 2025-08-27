import config from '../config'

const sanitizeUrl = (url: string) => (url?.endsWith('/') ? url.substring(0, url.length - 1) : url)

export interface RegisteredService {
  name: string
  hostname: string
  defaultBackLinkText: string
}

export const registeredBackLinkServices: RegisteredService[] = [
  {
    name: 'digital-prison-services',
    hostname: sanitizeUrl(config.serviceUrls.digitalPrison),
    defaultBackLinkText: 'View most recent search',
  },
  {
    name: 'welcome-people-into-prison',
    hostname: sanitizeUrl(config.serviceUrls.welcomePeopleIntoPrison),
    defaultBackLinkText: 'Back to Welcome people into prison',
  },
  {
    name: 'create-and-vary-a-licence',
    hostname: sanitizeUrl(config.serviceUrls.createAndVaryALicence),
    defaultBackLinkText: 'Back to Create and vary a licence',
  },
  {
    name: 'assess-for-early-release',
    hostname: sanitizeUrl(config.serviceUrls.assessForEarlyRelease),
    defaultBackLinkText: 'Back to Assess for early release',
  },
  {
    name: 'allocate-key-workers',
    hostname: sanitizeUrl(config.serviceUrls.allocateKeyWorkers),
    defaultBackLinkText: 'Back to key workers',
  },
  {
    name: 'allocate-personal-officers',
    hostname: sanitizeUrl(config.serviceUrls.allocatePersonalOfficers),
    defaultBackLinkText: 'Back to personal officers',
  },
]

export const saveBackLink =
  (registeredServices: Array<RegisteredService> = registeredBackLinkServices) =>
  async (req: any, res: any) => {
    const { service, returnPath, redirectPath, backLinkText } = req.query

    if (!service || !returnPath || !redirectPath) throw new Error('Required query parameters missing')

    const registeredService = registeredServices.find(e => e.name === service)
    if (!registeredService) throw new Error(`Could not find service: [${service}]`)

    if (registeredService.name === 'welcome-people-into-prison' && redirectPath.includes('add-case-note')) {
      req.flash('addCaseNoteRefererUrl', registeredService.hostname + returnPath)
    } else {
      req.session.userBackLink = {
        url: registeredService.hostname + returnPath,
        text: backLinkText || registeredService.defaultBackLinkText,
      }
    }

    res.redirect(sanitizeUrl(config.domain) + redirectPath)
  }
