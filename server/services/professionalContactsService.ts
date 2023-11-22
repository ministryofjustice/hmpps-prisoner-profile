import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { getNamesFromString, sortByDateTime } from '../utils/utils'
import AllocationManagerClient from '../data/interfaces/allocationManagerClient'
import { Address } from '../interfaces/prisonApi/address'
import { Pom } from '../interfaces/pom'
import { Contact, PomContact } from '../interfaces/staffContacts'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/prisonerProfileDeliusApiClient'
import { CommunityManager } from '../interfaces/prisonerProfileDeliusApi/communityManager'
import KeyWorkerClient from '../data/interfaces/keyWorkerClient'
import { KeyWorker } from '../interfaces/keyWorker'
import { AgenciesEmail } from '../interfaces/prisonApi/agencies'
import { Telephone } from '../interfaces/prisonApi/telephone'

interface ProfessionalContact {
  relationshipDescription: string
  firstName: string
  lastName: string
  emails: string[]
  phones: string[]
  address?: Address & { label: string }
}
export default class ProfessionalContactsService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly allocationApiClientBuilder: RestClientBuilder<AllocationManagerClient>,
    private readonly prisonerProfileDeliusApiClientBuilder: RestClientBuilder<PrisonerProfileDeliusApiClient>,
    private readonly keyworkerApiClientBuilder: RestClientBuilder<KeyWorkerClient>,
  ) {}

  async getContacts(clientToken: string, prisonerNumber: string, bookingId: number): Promise<ProfessionalContact[]> {
    const [contacts, allocationManager, communityManager, keyWorker] = await Promise.all([
      this.prisonApiClientBuilder(clientToken).getBookingContacts(bookingId),
      this.allocationApiClientBuilder(clientToken).getPomByOffenderNo(prisonerNumber),
      this.prisonerProfileDeliusApiClientBuilder(clientToken).getCommunityManager(prisonerNumber),
      this.keyworkerApiClientBuilder(clientToken).getOffendersKeyWorker(prisonerNumber),
    ])

    // filter out COM and POM from prison API contacts as they are reliably retrieved from other API calls
    const activePrisonApiContacts = contacts.otherContacts
      ? contacts.otherContacts.filter(
          contact =>
            contact.relationship !== 'COM' &&
            contact.relationship !== 'POM' &&
            contact.activeFlag &&
            contact.contactType === 'O',
        )
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
            .map<ProfessionalContact>(address =>
              mapPrisonApiContactToProfessionalContact(contact, address, emails, phones),
            )
        }),
    )

    return [
      ...contactForEachAddress,
      communityManager ? mapCommunityManagerToProfessionalContact(communityManager) : [],
      keyWorker ? mapKeyWorkerToProfessionalContact(keyWorker) : [],
      allocationManager ? getPomContacts(allocationManager) : [],
    ]
      .flat()
      .sort(this.sortProfessionalContacts)
  }

  sortProfessionalContacts = (left: ProfessionalContact, right: ProfessionalContact) => {
    const jobTitleOrder = ['Prison Offender Manager', 'Co-working Prison Offender Manager']
    const leftJobTitleIndex = jobTitleOrder.indexOf(left.relationshipDescription)
    const rightJobTitleIndex = jobTitleOrder.indexOf(right.relationshipDescription)

    // both the exceptions so compare
    if (leftJobTitleIndex !== -1 && rightJobTitleIndex !== -1) {
      if (leftJobTitleIndex < rightJobTitleIndex) return -1
      if (leftJobTitleIndex > rightJobTitleIndex) return 1
    }

    if (leftJobTitleIndex !== -1) return -1 // left only is a special case so sort first
    if (rightJobTitleIndex !== -1) return 1 // right only is a special case so sort first

    // If both have the same job title order or neither is a special case,
    // compare based on relationshipDescription and lastName
    const relationshipCompare = left.relationshipDescription.localeCompare(right.relationshipDescription)
    if (relationshipCompare) return relationshipCompare

    return left.lastName.localeCompare(right.lastName)
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
}

function getPomContacts(allocationManager: Pom): ProfessionalContact[] {
  return (
    allocationManager &&
    Object.entries(allocationManager)
      .filter(([, value]) => value.name)
      .map(([key, value]) => mapPomToProfessionalContact(key as 'primary_pom' | 'secondary_pom', value))
  )
}

function mapCommunityManagerToProfessionalContact(communityManager: CommunityManager): ProfessionalContact {
  const { email, telephone } = communityManager
  const { forename, surname } = communityManager.name
  const { email: teamEmail, telephone: teamTelephone } = communityManager.team

  return {
    firstName: forename,
    lastName: surname,
    emails: [email, teamEmail].filter(Boolean),
    phones: [telephone, teamTelephone].filter(Boolean),
    address: undefined,
    relationshipDescription: 'Community Offender Manager',
  }
}

function mapKeyWorkerToProfessionalContact(keyWorker: KeyWorker): ProfessionalContact {
  const { firstName, lastName, email } = keyWorker

  return {
    firstName,
    lastName,
    emails: [email].filter(Boolean),
    phones: [],
    address: undefined,
    relationshipDescription: 'Key Worker',
  }
}

function mapPomToProfessionalContact(jobTitle: 'primary_pom' | 'secondary_pom', pom: PomContact): ProfessionalContact {
  const { name } = pom

  return {
    firstName: getNamesFromString(name)[0],
    lastName: getNamesFromString(name).pop(),
    emails: [],
    phones: [],
    address: undefined,
    relationshipDescription:
      jobTitle === 'primary_pom' ? 'Prison Offender Manager' : 'Co-working Prison Offender Manager',
  }
}

function mapPrisonApiContactToProfessionalContact(
  contact: Contact,
  address: Address,
  emails: AgenciesEmail[],
  phones: Telephone[],
): ProfessionalContact {
  const { firstName, lastName } = contact

  return {
    firstName,
    lastName,
    address: { ...address, label: address.primary ? 'Main address' : 'Other address' },
    emails: emails.map(email => email.email),
    phones: [...phones, ...(address.phones ?? [])].map(phone => phone.number),
    relationshipDescription: contact.relationshipDescription,
  }
}
