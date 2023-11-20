import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { getNamesFromString, groupBy, sortByDateTime } from '../utils/utils'
import AllocationManagerClient from '../data/interfaces/allocationManagerClient'
import { Address } from '../interfaces/prisonApi/address'
import { Pom } from '../interfaces/pom'
import { PomContact, PrisonerContactWithContactDetails } from '../interfaces/staffContacts'

export default class ProfessionalContactsService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly allocationApiClientBuilder: RestClientBuilder<AllocationManagerClient>,
  ) {}

  async getContacts(
    clientToken: string,
    prisonerNumber: string,
    bookingId: number,
  ): Promise<{ relationship: string; contacts: PrisonerContactWithContactDetails[] | PomContact[] }[]> {
    const [contacts, allocationManager] = await Promise.all([
      this.prisonApiClientBuilder(clientToken).getBookingContacts(bookingId),
      this.allocationApiClientBuilder(clientToken).getPomByOffenderNo(prisonerNumber),
    ])

    const activeOfficialContacts = contacts.otherContacts
      ? contacts.otherContacts.filter(contact => contact.activeFlag && contact.contactType === 'O')
      : []

    const currentDate = new Date()

    const contactForEachAddress: PrisonerContactWithContactDetails[] =
      activeOfficialContacts.length &&
      (
        await Promise.all(
          activeOfficialContacts
            .sort((left, right) => left.firstName.localeCompare(right.firstName))
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
      ).flat()

    const contactsGroupedByRelationship = contactForEachAddress.length
      ? Object.entries(
          groupBy<PrisonerContactWithContactDetails>(contactForEachAddress, 'relationshipDescription'),
        ).map(([key, value]) => ({
          relationship: key,
          contacts: value,
        }))
      : []

    return [...contactsGroupedByRelationship, ...this.getPomContacts(allocationManager)].sort((left, right) =>
      left.relationship.localeCompare(right.relationship),
    )
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

    return pomStaff?.length ? [{ relationship: 'Prison Offender Manager', contacts: pomStaff }] : []
  }
}
