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
import KeyWorker from '../data/interfaces/keyWorkerApi/KeyWorker'
import { AgenciesEmail } from '../data/interfaces/prisonApi/Agency'
import Telephone from '../data/interfaces/prisonApi/Telephone'
import AllocationManagerClient from '../data/interfaces/allocationManagerApi/allocationManagerClient'
import { Result } from '../utils/result/result'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { youthEstatePrisons } from '../data/constants/youthEstatePrisons'
import { ContactRelationship } from '../data/enums/ContactRelationship'
import { formatDate } from '../utils/dateHelpers'
import config from '../config'
import { ComplexityLevel } from '../data/interfaces/complexityApi/ComplexityOfNeed'
import ComplexityApiClient from '../data/interfaces/complexityApi/complexityApiClient'
import Pom from '../data/interfaces/allocationManagerApi/Pom'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'

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
    const [contacts, allocationManager, communityManager, keyWorker] = await Promise.all([
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
      mapCommunityManagerToProfessionalContact(communityManager),
      mapKeyWorkerToProfessionalContact(keyWorker),
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
      : this.getStaffContactsOverview(clientToken, bookingId, prisonerNumber, prisonId, apiErrorCallback)
  }

  private async getYouthStaffContactsOverview(clientToken: string, bookingId: number) {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const contacts = await prisonApi.getBookingContacts(bookingId)

    const youthStaffContacts: YouthStaffContacts = {
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
    prisonId: string,
    apiErrorCallback: (error: Error) => void = () => null,
  ): Promise<StaffContacts> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerProfileDeliusApiClient = this.prisonerProfileDeliusApiClientBuilder(clientToken)
    const allocationManagerApiClient = this.allocationApiClientBuilder(clientToken)

    const [communityManager, allocationManager, keyWorkerName, keyWorkerSessions, bookingContacts] = await Promise.all([
      Result.wrap(prisonerProfileDeliusApiClient.getCommunityManager(prisonerNumber), apiErrorCallback),
      Result.wrap(allocationManagerApiClient.getPomByOffenderNo(prisonerNumber), apiErrorCallback),
      Result.wrap(this.getKeyWorkerName(clientToken, prisonerNumber, prisonId), apiErrorCallback),
      prisonApi.getCaseNoteSummaryByTypes({ type: 'KA', subType: 'KS', numMonths: 38, bookingId }),
      prisonApi.getBookingContacts(bookingId),
    ])

    return {
      keyWorker: keyWorkerName
        .map(name => ({
          name,
          lastSession:
            keyWorkerSessions?.[0] !== undefined ? formatDate(keyWorkerSessions[0].latestCaseNote, 'short') : '',
        }))
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
        .sort((a, b) => sortByDateTime(b.createDateTime, a.createDateTime))
        .map(contact =>
          formatName(contact.firstName, null, contact.lastName, { style: NameFormatStyle.firstLast }),
        )?.[0],
    }
  }

  private getKeyWorkerName = async (clientToken: string, prisonerNumber: string, prisonId: string): Promise<string> => {
    const keyWorkerClient = this.keyworkerApiClientBuilder(clientToken)
    const complexityApiClient = this.complexityApiClientBuilder(clientToken)

    const complexityLevel =
      config.featureToggles.complexityEnabledPrisons.includes(prisonId) &&
      (await complexityApiClient.getComplexityOfNeed(prisonerNumber))?.level

    if (complexityLevel === ComplexityLevel.High) return 'None - high complexity of need'

    const keyWorker = await keyWorkerClient.getOffendersKeyWorker(prisonerNumber)
    return keyWorker && keyWorker.firstName
      ? `${convertToTitleCase(keyWorker.firstName)} ${convertToTitleCase(keyWorker.lastName)}`
      : 'Not allocated'
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

function mapKeyWorkerToProfessionalContact(
  keyWorkerResult: Result<KeyWorker>,
): Result<ProfessionalContact, ProfessionalContactApiError>[] {
  if (keyWorkerResult.isFulfilled() && keyWorkerResult.getOrThrow() === null) return []

  const keyworkerRelationship = { relationship: 'KW', relationshipDescription: 'Key Worker' }

  return [
    keyWorkerResult.map(
      keyWorker =>
        ({
          ...keyworkerRelationship,
          firstName: keyWorker.firstName,
          lastName: keyWorker.lastName,
          emails: [keyWorker.email].filter(Boolean),
          phones: [],
          address: undefined,
        }) as ProfessionalContact,
      _error => keyworkerRelationship,
    ),
  ]
}

function mapPomToProfessionalContact(
  pomResult: Result<Pom>,
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
