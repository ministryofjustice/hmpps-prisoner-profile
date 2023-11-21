import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { getNamesFromString, groupBy, sortByDateTime } from '../utils/utils'
import AllocationManagerClient from '../data/interfaces/allocationManagerClient'
import { Address } from '../interfaces/prisonApi/address'
import { Pom } from '../interfaces/pom'
import { PomContact, PrisonerContactWithContactDetails } from '../interfaces/staffContacts'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/prisonerProfileDeliusApiClient'
import { CommunityManager } from '../interfaces/prisonerProfileDeliusApi/communityManager'

interface ComContact extends CommunityManager {
  relationshipDescription: string
  firstName: string
  lastName: string
  emails: string[]
}
export default class ProfessionalContactsService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly allocationApiClientBuilder: RestClientBuilder<AllocationManagerClient>,
    private readonly prisonerProfileDeliusApiClientBuilder: RestClientBuilder<PrisonerProfileDeliusApiClient>,
  ) {}

  async getContacts(
    clientToken: string,
    prisonerNumber: string,
    bookingId: number,
  ): Promise<{ relationship: string; contacts: (PrisonerContactWithContactDetails | PomContact | ComContact)[] }[]> {
    const [contacts, allocationManager, communityManager] = await Promise.all([
      this.prisonApiClientBuilder(clientToken).getBookingContacts(bookingId),
      this.allocationApiClientBuilder(clientToken).getPomByOffenderNo(prisonerNumber),
      this.prisonerProfileDeliusApiClientBuilder(clientToken).getCommunityManager(prisonerNumber),
    ])

    const activePrisonApiContacts = contacts.otherContacts
      ? contacts.otherContacts.filter(contact => contact.activeFlag && contact.contactType === 'O')
      : []

    const currentDate = new Date()

    const contactForEachAddress = await Promise.all(
      activePrisonApiContacts
        .sort((left, right) => left.lastName.localeCompare(right.lastName))
        .map(async contact => {
          const personContactDetails = await this.getPersonContactDetails(clientToken, contact.personId)
          const { addresses, emails, phones } = personContactDetails

          return addresses
            .filter(address => !address.endDate || new Date(address.endDate) >= currentDate)
            .sort((left, right) => this.sortByPrimaryAndStartDate(left, right))
            .map<PrisonerContactWithContactDetails>(address => ({
              ...contact,
              address: { ...address, label: address.primary ? 'Main address' : 'Other address' },
              emails: emails.map(email => email.email),
              phones: [...phones, ...(address.phones ?? [])].map(phone => phone.number),
            }))
        }),
    )

    const prisonAndComContacts = [...contactForEachAddress.flat(), mapCommunityManagerToComContact(communityManager)]

    const contactsGroupedByRelationship = Object.entries(groupBy(prisonAndComContacts, 'relationshipDescription'))
      .map(([key, value]) => ({
        relationship: key,
        contacts: value,
      }))
      .sort((left, right) => left.relationship.localeCompare(right.relationship))

    return [...this.getPomContacts(allocationManager), ...contactsGroupedByRelationship]
  }

  async getPersonContactDetails(token: string, personId: number) {
    const prisonApi = this.prisonApiClientBuilder(token)
    const [addresses, emails, phones] = await Promise.all([
      prisonApi.getAddressesForPerson(personId),
      prisonApi.getPersonEmails(personId),
      prisonApi.getPersonPhones(personId),
    ])

    return {
      addresses,
      emails,
      phones,
    }
  }

  private sortByPrimaryAndStartDate = (left: Address, right: Address) => {
    if (left.primary && !right.primary) return -1
    if (!left.primary && right.primary) return 1

    return sortByDateTime(right.startDate, left.startDate) // Most recently added first
  }

  private getPomContacts(allocationManager: Pom): { relationship: string; contacts: PomContact[] }[] {
    const pomStaff =
      allocationManager &&
      Object.entries(allocationManager)
        .filter(([, value]) => value.name)
        .map(([key, value]) => ({
          name: getNamesFromString(value.name).join(' '),
          jobTitle: key === 'secondary_pom' && 'Co-worker',
        }))

    return pomStaff?.length ? [{ relationship: 'Prison Offender Manager', contacts: sortPomsByLastName(pomStaff) }] : []
  }
}

function sortPomsByLastName(contacts: PomContact[]) {
  const getLastName = (name: string) => name.split(' ').pop()
  return contacts.sort((left, right) => {
    const leftLastName = getLastName(left.name)
    const rightLastName = getLastName(right.name)

    if (leftLastName && rightLastName) {
      return leftLastName.localeCompare(rightLastName)
    }

    return 0
  })
}

function mapCommunityManagerToComContact(communityManager: CommunityManager): ComContact {
  const { forename, surname, email } = communityManager.name
  const { code, description, email: teamEmail } = communityManager.team

  return {
    firstName: forename,
    lastName: surname,
    emails: [email, teamEmail].filter(Boolean),
    code,
    name: { forename, surname },
    relationshipDescription: 'Community Offender Manager',
    team: { code, description },
    unallocated: communityManager.unallocated,
  }
}
