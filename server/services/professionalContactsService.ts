import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import {
  convertToTitleCase,
  formatCommunityManager,
  formatName,
  formatPomName,
  getNamesFromString,
  sortArrayOfObjectsByDate,
  sortByDateTime,
  SortType,
} from '../utils/utils'
import Address from '../data/interfaces/prisonApi/Address'
import StaffContacts, { Contact, YouthStaffContacts } from '../data/interfaces/prisonApi/StaffContacts'
import { PrisonerProfileDeliusApiClient } from '../data/interfaces/deliusApi/prisonerProfileDeliusApiClient'
import CommunityManager from '../data/interfaces/deliusApi/CommunityManager'
import KeyWorkerClient from '../data/interfaces/keyWorkerApi/keyWorkerClient'
import { AgenciesEmail } from '../data/interfaces/prisonApi/Agency'
import Telephone from '../data/interfaces/prisonApi/Telephone'
import AllocationManagerClient from '../data/interfaces/allocationManagerApi/allocationManagerClient'
import { Result } from '../utils/result/result'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { youthEstatePrisons } from '../data/constants/youthEstatePrisons'
import { ContactRelationship } from '../data/enums/ContactRelationship'
import { formatDate } from '../utils/dateHelpers'
import ComplexityApiClient from '../data/interfaces/complexityApi/complexityApiClient'
import Pom from '../data/interfaces/allocationManagerApi/Pom'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import StaffAllocation from '../data/interfaces/keyWorkerApi/StaffAllocation'

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
    private readonly complexityApiClientBuilder: RestClientBuilder<ComplexityApiClient>,
  ) {}

  async getContacts(
    clientToken: string,
    prisonerNumber: string,
    bookingId: number,
    isYouthPrisoner: boolean,
    apiErrorCallback: (error: Error) => void = () => null,
  ): Promise<Result<ProfessionalContact, ProfessionalContactApiError>[]> {
    const [contacts, allocationManager, communityManager, allocations] = await Promise.all([
      this.prisonApiClientBuilder(clientToken).getBookingContacts(bookingId),
      Result.wrap(
        isYouthPrisoner ? null : this.allocationApiClientBuilder(clientToken).getPomByOffenderNo(prisonerNumber),
        apiErrorCallback,
      ),
      Result.wrap(
        isYouthPrisoner
          ? null
          : this.prisonerProfileDeliusApiClientBuilder(clientToken).getCommunityManager(prisonerNumber),
        apiErrorCallback,
      ),
      Result.wrap(
        isYouthPrisoner
          ? null
          : this.keyworkerApiClientBuilder(clientToken).getCurrentAllocations(prisonerNumber, true),
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
      mapCommunityManagerToProfessionalContact(communityManager),
      mapAllocationsToKeyWorkerContacts(allocations),
      mapAllocationsToPersonalOfficerContacts(allocations),
      mapPomToProfessionalContact(allocationManager),
    ]
      .flat()
      .sort(this.sortProfessionalContacts)
  }

  private sortProfessionalContacts = (
    left: Result<ProfessionalContact, ProfessionalContactApiError>,
    right: Result<ProfessionalContact, ProfessionalContactApiError>,
  ) => {
    const jobTitleOrder = [
      'Key Worker',
      'Personal Officer',
      'Prison Offender Manager',
      'Co-working Prison Offender Manager',
      'Community Offender Manager',
      'CuSP Officer',
      'CuSP Officer (backup)',
      'Youth Justice Worker',
      'Resettlement Practitioner',
      'Resettlement Worker',
      'Youth Justice Service',
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

  private async getPersonContactDetails(token: string, personId: number) {
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

  getProfessionalContactsOverview(
    clientToken: string,
    { prisonId, bookingId, prisonerNumber }: Prisoner,
    apiErrorCallback: (error: Error) => void = () => null,
  ): Promise<YouthStaffContacts | StaffContacts> {
    const isYouthPrisoner = youthEstatePrisons.includes(prisonId)
    return isYouthPrisoner
      ? this.getYouthStaffContactsOverview(clientToken, bookingId)
      : this.getStaffContactsOverview(clientToken, bookingId, prisonerNumber, apiErrorCallback)
  }

  private async getYouthStaffContactsOverview(
    clientToken: string,
    bookingId: number,
    apiErrorCallback: (error: Error) => void = () => null,
  ) {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const contactsResult = await Result.wrap(prisonApi.getBookingContacts(bookingId), apiErrorCallback)
    const contacts: { otherContacts: Contact[] } = contactsResult.getOrNull() || { otherContacts: [] }

    const youthStaffContacts: YouthStaffContacts = {
      callFailed: !contactsResult.isFulfilled(),
      cuspOfficer: null,
      cuspOfficerBackup: null,
      youthJusticeWorker: null,
      resettlementPractitioner: null,
      youthJusticeService: null,
      youthJusticeServiceCaseManager: null,
    }

    // Return the most recently created record for each of the YOI contact relationships if available
    sortArrayOfObjectsByDate<Contact>(contacts.otherContacts, 'createDateTime', SortType.ASC).forEach(c => {
      switch (c.relationship) {
        case ContactRelationship.CuspOfficer:
          youthStaffContacts.cuspOfficer = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.CuspOfficerBackup:
          youthStaffContacts.cuspOfficerBackup = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.YouthJusticeWorker:
          youthStaffContacts.youthJusticeWorker = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.ResettlementPractitioner:
          youthStaffContacts.resettlementPractitioner = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.YouthJusticeService:
          youthStaffContacts.youthJusticeService = formatName(c.firstName, null, c.lastName)
          break
        case ContactRelationship.YouthJusticeServiceCaseManager:
          youthStaffContacts.youthJusticeServiceCaseManager = formatName(c.firstName, null, c.lastName)
          break
        default:
      }
    })

    return youthStaffContacts
  }

  private async getStaffContactsOverview(
    clientToken: string,
    bookingId: number,
    prisonerNumber: string,
    apiErrorCallback: (error: Error) => void = () => null,
  ): Promise<StaffContacts> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerProfileDeliusApiClient = this.prisonerProfileDeliusApiClientBuilder(clientToken)
    const allocationManagerApiClient = this.allocationApiClientBuilder(clientToken)

    const keyWorkerClient = this.keyworkerApiClientBuilder(clientToken)

    const [communityManager, allocationManager, currentAllocatedStaff, bookingContacts] = await Promise.all([
      Result.wrap(prisonerProfileDeliusApiClient.getCommunityManager(prisonerNumber), apiErrorCallback),
      Result.wrap(allocationManagerApiClient.getPomByOffenderNo(prisonerNumber), apiErrorCallback),
      Result.wrap(keyWorkerClient.getCurrentAllocations(prisonerNumber), apiErrorCallback),
      prisonApi.getBookingContacts(bookingId),
    ])

    return {
      allocationPolicies: currentAllocatedStaff
        .map(({ policies }) => {
          return {
            keyWorkerEnabled: !!policies.find(({ policy, enabled }) => policy === 'KEY_WORKER' && enabled),
            personalOfficerEnabled: !!policies.find(({ policy, enabled }) => policy === 'PERSONAL_OFFICER' && enabled),
          }
        })
        .toPromiseSettledResult(),
      keyWorker: currentAllocatedStaff
        .map(({ allocations, hasHighComplexityOfNeeds }) => {
          const allocatedKeyWorker = allocations.find(itm => itm.policy.code === 'KEY_WORKER')?.staffMember
          if (hasHighComplexityOfNeeds) {
            return 'None - high complexity of need'
          }
          if (allocatedKeyWorker) {
            return `${convertToTitleCase(allocatedKeyWorker.firstName)} ${convertToTitleCase(allocatedKeyWorker.lastName)}`
          }
          return 'Unassigned'
        })
        .toPromiseSettledResult(),
      personalOfficer: currentAllocatedStaff
        .map(({ allocations }) => {
          const allocatedStaff = allocations.find(itm => itm.policy.code === 'PERSONAL_OFFICER')?.staffMember
          if (allocatedStaff) {
            return `${convertToTitleCase(allocatedStaff.firstName)} ${convertToTitleCase(allocatedStaff.lastName)}`
          }
          return 'Unassigned'
        })
        .toPromiseSettledResult(),
      lastSession: currentAllocatedStaff
        .map(({ policies, latestRecordedEvents }) => {
          const keyWorkerEnabled = !!policies.find(({ policy, enabled }) => policy === 'KEY_WORKER' && enabled)
          const personalOfficerEnabled = !!policies.find(
            ({ policy, enabled }) => policy === 'PERSONAL_OFFICER' && enabled,
          )

          const lastSessions = latestRecordedEvents.filter(
            itm =>
              (keyWorkerEnabled && itm.type === 'SESSION' && itm.policy === 'KEY_WORKER') ||
              (personalOfficerEnabled && itm.type === 'ENTRY' && itm.policy === 'PERSONAL_OFFICER'),
          )
          if (lastSessions.length) {
            return formatDate(
              lastSessions.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0].occurredAt,
              'short',
            )
          }
          return 'No previous session'
        })
        .toPromiseSettledResult(),
      prisonOffenderManager: allocationManager
        .map(pom => formatPomName(pom?.primary_pom?.name))
        .toPromiseSettledResult(),
      coworkingPrisonOffenderManager: allocationManager
        .map(pom => formatPomName(pom?.secondary_pom?.name))
        .toPromiseSettledResult(),
      communityOffenderManager: communityManager.map(formatCommunityManager).toPromiseSettledResult(),
      resettlementWorker: bookingContacts.otherContacts
        ?.filter(contact => contact.relationship === 'RW' && contact.activeFlag)
        ?.sort((a, b) => sortByDateTime(b.createDateTime, a.createDateTime))
        ?.map(contact =>
          formatName(contact.firstName, null, contact.lastName, { style: NameFormatStyle.firstLast }),
        )?.[0],
    }
  }
}

function mapCommunityManagerToProfessionalContact(
  communityManagerResult: Result<CommunityManager>,
): Result<ProfessionalContact, ProfessionalContactApiError>[] {
  if (communityManagerResult.isFulfilled() && communityManagerResult.getOrThrow() === null) return []

  const comRelationship = { relationship: 'COM', relationshipDescription: 'Community Offender Manager' }

  return [
    communityManagerResult.map(
      com =>
        ({
          ...comRelationship,
          firstName: com.name.forename,
          lastName: com.name.surname,
          teamName: com.team.description,
          emails: [com.email, com.team.email].filter(Boolean),
          phones: [com.telephone, com.team.telephone].filter(Boolean),
          address: undefined,
          unallocated: com.unallocated,
        }) as ProfessionalContact,
      _error => comRelationship,
    ),
  ]
}

function mapAllocationsToKeyWorkerContacts(
  allocationResult: Result<StaffAllocation>,
): Result<ProfessionalContact, ProfessionalContactApiError>[] {
  if (allocationResult.isFulfilled() && allocationResult.getOrThrow() === null) return []

  const keyworkerRelationship = { relationship: 'KW', relationshipDescription: 'Key Worker' }

  try {
    return [
      allocationResult.map(
        ({ allocations }) => {
          const staff = allocations.find(itm => itm.policy.code === 'KEY_WORKER')?.staffMember
          if (staff) {
            return {
              ...keyworkerRelationship,
              firstName: staff.firstName,
              lastName: staff.lastName,
              emails: staff.emailAddresses.filter(Boolean),
              phones: [],
              address: undefined,
            } as ProfessionalContact
          }
          throw new Error('No key worker found')
        },
        _error => keyworkerRelationship,
      ),
    ]
  } catch {
    return []
  }
}

function mapAllocationsToPersonalOfficerContacts(
  allocationResult: Result<StaffAllocation>,
): Result<ProfessionalContact, ProfessionalContactApiError>[] {
  if (allocationResult.isFulfilled() && allocationResult.getOrThrow() === null) return []

  const personalOfficerRelationship = { relationship: 'PO', relationshipDescription: 'Personal Officer' }

  try {
    return [
      allocationResult.map(
        ({ allocations }) => {
          const staff = allocations.find(itm => itm.policy.code === 'PERSONAL_OFFICER')?.staffMember
          if (staff) {
            return {
              ...personalOfficerRelationship,
              firstName: staff.firstName,
              lastName: staff.lastName,
              emails: staff.emailAddresses.filter(Boolean),
              phones: [],
              address: undefined,
            } as ProfessionalContact
          }
          throw new Error('No personal officer found')
        },
        _error => personalOfficerRelationship,
      ),
    ]
  } catch {
    return []
  }
}

function mapPomToProfessionalContact(
  pomResult: Result<Pom | null>,
): Result<ProfessionalContact, ProfessionalContactApiError>[] {
  if (pomResult.isFulfilled() && pomResult.getOrThrow() === null) return []

  const pomRelationship = (jobTitle: string) => ({
    relationship: 'POM',
    relationshipDescription:
      jobTitle === 'primary_pom' ? 'Prison Offender Manager' : 'Co-working Prison Offender Manager',
  })

  return pomResult.handle({
    fulfilled: (pom: Pom) => {
      return Object.entries(pom)
        .filter(([, value]) => value.name)
        .map(([key, value]) => {
          return Result.fulfilled({
            ...pomRelationship(key),
            firstName: getNamesFromString(value.name)[0],
            lastName: getNamesFromString(value.name).pop(),
            emails: [],
            phones: [],
            address: undefined,
          })
        })
    },
    rejected: () => {
      return [pomRelationship('primary_pom'), pomRelationship('secondary_pom')].map(reason => Result.rejected(reason))
    },
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
      : { label: 'Not entered', primary: true, mail: false, noFixedAddress: false },
    emails: emails.map(email => email.email),
    phones: [...phones, ...(address?.phones ?? [])].map(phone => phone.number),
    relationshipDescription: contact.relationshipDescription,
    relationship: contact.relationship,
  })
}
