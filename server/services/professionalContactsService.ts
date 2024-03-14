import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { getNamesFromString, sortByDateTime } from '../utils/utils'
import Address from '../data/interfaces/prisonApi/Address'
import { Contact, PomContact } from '../data/interfaces/prisonApi/StaffContacts'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/deliusApi/prisonerProfileDeliusApiClient'
import CommunityManager from '../data/interfaces/deliusApi/CommunityManager'
import KeyWorkerClient from '../data/interfaces/keyWorkerApi/keyWorkerClient'
import KeyWorker from '../data/interfaces/keyWorkerApi/KeyWorker'
import { AgenciesEmail } from '../data/interfaces/prisonApi/Agency'
import Telephone from '../data/interfaces/prisonApi/Telephone'
import AllocationManagerClient from '../data/interfaces/allocationManagerApi/allocationManagerClient'
import Pom from '../data/interfaces/allocationManagerApi/Pom'

interface ProfessionalContact {
  relationshipDescription: string
  relationship: string
  firstName: string
  lastName: string
  teamName?: string
  emails: string[]
  phones: string[]
  address?: Address & { label: string }
  unallocated?: boolean
}
export default class ProfessionalContactsService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly allocationApiClientBuilder: RestClientBuilder<AllocationManagerClient>,
    private readonly prisonerProfileDeliusApiClientBuilder: RestClientBuilder<PrisonerProfileDeliusApiClient>,
    private readonly keyworkerApiClientBuilder: RestClientBuilder<KeyWorkerClient>,
  ) {}

  async getContacts(
    clientToken: string,
    prisonerNumber: string,
    bookingId: number,
    isYouthPrisoner: boolean,
  ): Promise<ProfessionalContact[]> {
    const [contacts, allocationManager, communityManager, keyWorker] = await Promise.all([
      this.prisonApiClientBuilder(clientToken).getBookingContacts(bookingId),
      isYouthPrisoner ? null : this.allocationApiClientBuilder(clientToken).getPomByOffenderNo(prisonerNumber),
      isYouthPrisoner
        ? null
        : this.prisonerProfileDeliusApiClientBuilder(clientToken).getCommunityManager(prisonerNumber),
      isYouthPrisoner ? null : this.keyworkerApiClientBuilder(clientToken).getOffendersKeyWorker(prisonerNumber),
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

          if (addresses?.length === 0) {
            return [mapPrisonApiContactToProfessionalContact(contact, null, emails, phones)]
          }

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
    const jobTitleOrder = [
      'Key Worker',
      'Prison Offender Manager',
      'Co-working Prison Offender Manager',
      'Community Offender Manager',
      'CuSP Officer',
      'CuSP Officer (backup)',
      'Youth Justice Worker',
      'Resettlement Practitioner',
      'Youth Justice Service',
    ]
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
  const { email, telephone, unallocated } = communityManager
  const { forename, surname } = communityManager.name
  const { email: teamEmail, telephone: teamTelephone } = communityManager.team

  return {
    firstName: forename,
    lastName: surname,
    teamName: communityManager.team.description,
    emails: [email, teamEmail].filter(Boolean),
    phones: [telephone, teamTelephone].filter(Boolean),
    address: undefined,
    relationshipDescription: 'Community Offender Manager',
    relationship: 'COM',
    unallocated,
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
    relationship: 'KW',
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
    relationship: 'POM',
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
    address: address
      ? { ...address, label: address.primary ? 'Main address' : 'Other address' }
      : { label: 'Not entered', primary: true, noFixedAddress: false },
    emails: emails.map(email => email.email),
    phones: [...phones, ...(address?.phones ?? [])].map(phone => phone.number),
    relationshipDescription: contact.relationshipDescription,
    relationship: contact.relationship,
  }
}
