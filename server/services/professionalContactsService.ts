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
import { Result } from '../utils/result/result'

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

interface ProfessionalContactApiError {
  relationshipDescription: string
  relationship: string
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
    apiErrorCallback: (error: Error) => void = () => null,
  ): Promise<Result<ProfessionalContact, ProfessionalContactApiError>[]> {
    const [contacts, allocationManager, communityManager, keyWorker] = await Promise.all([
      this.prisonApiClientBuilder(clientToken).getBookingContacts(bookingId),
      isYouthPrisoner ? null : this.allocationApiClientBuilder(clientToken).getPomByOffenderNo(prisonerNumber),
      isYouthPrisoner
        ? null
        : this.prisonerProfileDeliusApiClientBuilder(clientToken).getCommunityManager(prisonerNumber),
      Result.wrap(
        isYouthPrisoner ? null : this.keyworkerApiClientBuilder(clientToken).getOffendersKeyWorker(prisonerNumber),
        apiErrorCallback,
      ),
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
            .map(address => mapPrisonApiContactToProfessionalContact(contact, address, emails, phones))
        }),
    )

    return [
      ...contactForEachAddress,
      communityManager ? mapCommunityManagerToProfessionalContact(communityManager) : [],
      mapKeyWorkerToProfessionalContact(keyWorker),
      allocationManager ? getPomContacts(allocationManager) : [],
    ]
      .flat()
      .sort(this.sortProfessionalContacts)
  }

  sortProfessionalContacts = (
    left: Result<ProfessionalContact, ProfessionalContactApiError>,
    right: Result<ProfessionalContact, ProfessionalContactApiError>,
  ) => {
    const jobTitleOrder = [
      'Key Worker',
      'Prison Offender Manager',
      'Co-working Prison Offender Manager',
      'Community Offender Manager',
      'CuSP Officer',
      'CuSP Officer (backup)',
      'Youth Justice Worker',
      'Resettlement Practitioner',
      'Youth Justice Services',
      'Youth Justice Service Case Manager',
    ]
    const leftRelationshipDescription = left.getOrHandle(e => e).relationshipDescription
    const rightRelationshipDescription = right.getOrHandle(e => e).relationshipDescription
    const leftJobTitleIndex = jobTitleOrder.indexOf(leftRelationshipDescription)
    const rightJobTitleIndex = jobTitleOrder.indexOf(rightRelationshipDescription)

    // both the exceptions so compare
    if (leftJobTitleIndex !== -1 && rightJobTitleIndex !== -1) {
      if (leftJobTitleIndex < rightJobTitleIndex) return -1
      if (leftJobTitleIndex > rightJobTitleIndex) return 1
    }

    if (leftJobTitleIndex !== -1) return -1 // left only is a special case so sort first
    if (rightJobTitleIndex !== -1) return 1 // right only is a special case so sort first

    // If both have the same job title order or neither is a special case,
    // compare based on relationshipDescription and lastName
    const relationshipCompare = leftRelationshipDescription.localeCompare(rightRelationshipDescription)
    if (relationshipCompare) return relationshipCompare

    if (!left.isFulfilled()) return -1
    if (!right.isFulfilled()) return 1

    return left.getOrThrow().lastName.localeCompare(right.getOrThrow().lastName)
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

function getPomContacts(allocationManager: Pom): Result<ProfessionalContact, ProfessionalContactApiError>[] {
  return (
    allocationManager &&
    Object.entries(allocationManager)
      .filter(([, value]) => value.name)
      .map(([key, value]) => mapPomToProfessionalContact(key as 'primary_pom' | 'secondary_pom', value))
  )
}

function mapCommunityManagerToProfessionalContact(
  communityManager: CommunityManager,
): Result<ProfessionalContact, ProfessionalContactApiError> {
  const { email, telephone, unallocated } = communityManager
  const { forename, surname } = communityManager.name
  const { email: teamEmail, telephone: teamTelephone } = communityManager.team

  return Result.fulfilled({
    firstName: forename,
    lastName: surname,
    teamName: communityManager.team.description,
    emails: [email, teamEmail].filter(Boolean),
    phones: [telephone, teamTelephone].filter(Boolean),
    address: undefined,
    relationshipDescription: 'Community Offender Manager',
    relationship: 'COM',
    unallocated,
  })
}

function mapKeyWorkerToProfessionalContact(
  keyWorkerResult: Result<KeyWorker>,
): Result<ProfessionalContact, ProfessionalContactApiError>[] {
  if (keyWorkerResult.isFulfilled() && keyWorkerResult.getOrThrow() === null) return []

  const keyworkerRelationship = { relationship: 'KW', relationshipDescription: 'Key Worker' }

  return [
    keyWorkerResult.map(
      keyWorker => ({
        ...keyworkerRelationship,
        firstName: keyWorker.firstName,
        lastName: keyWorker.lastName,
        emails: [keyWorker.email].filter(Boolean),
        phones: [],
        address: undefined,
      }),
      _error => keyworkerRelationship,
    ),
  ]
}

function mapPomToProfessionalContact(
  jobTitle: 'primary_pom' | 'secondary_pom',
  pom: PomContact,
): Result<ProfessionalContact, ProfessionalContactApiError> {
  const { name } = pom

  return Result.fulfilled({
    firstName: getNamesFromString(name)[0],
    lastName: getNamesFromString(name).pop(),
    emails: [],
    phones: [],
    address: undefined,
    relationshipDescription:
      jobTitle === 'primary_pom' ? 'Prison Offender Manager' : 'Co-working Prison Offender Manager',
    relationship: 'POM',
  })
}

function mapPrisonApiContactToProfessionalContact(
  contact: Contact,
  address: Address,
  emails: AgenciesEmail[],
  phones: Telephone[],
): Result<ProfessionalContact, ProfessionalContactApiError> {
  const { firstName, lastName } = contact

  return Result.fulfilled({
    firstName,
    lastName,
    address: address
      ? { ...address, label: address.primary ? 'Main address' : 'Other address' }
      : { label: 'Not entered', primary: true, noFixedAddress: false },
    emails: emails.map(email => email.email),
    phones: [...phones, ...(address?.phones ?? [])].map(phone => phone.number),
    relationshipDescription: contact.relationshipDescription,
    relationship: contact.relationship,
  })
}
