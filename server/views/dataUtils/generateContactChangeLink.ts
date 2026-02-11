import config from '../../config'
import { PersonalRelationshipsContact } from '../../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

export default function generateContactChangeLink(
  prisonerNumber: string,
  contact: PersonalRelationshipsContact,
): string {
  const params = new URLSearchParams({
    service: 'prisoner-profile',
    returnPath: `/prisoner/${prisonerNumber}/personal#next-of-kin`,
    redirectPath: `/prisoner/${prisonerNumber}/contacts/manage/${contact.contactId}/relationship/${contact.prisonerContactId}`,
  })
    .toString()
    .replace(/%2F/g, '/')
    .replace(/%23/g, '#')

  return `${config.serviceUrls.contacts}/save-backlink?${params}`
}
