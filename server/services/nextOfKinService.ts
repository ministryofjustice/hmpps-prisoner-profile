import { RestClientBuilder } from '../data'
import MetricsService from './metrics/metricsService'
import ReferenceDataService from './referenceData/referenceDataService'
import { ReferenceDataCodeDto } from '../data/interfaces/referenceData'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsContact,
  PersonalRelationshipsContactRequest,
  PersonalRelationshipsContactRequestAddress,
  PersonalRelationshipsReferenceDataDomain,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'
import { mapRelationshipDescriptionByCode } from '../utils/utils'

export default class NextOfKinService {
  constructor(
    private readonly personalRelationShipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient>,
    private readonly referenceDataService: ReferenceDataService,
    private readonly metricsService: MetricsService,
  ) {}

  async getNextOfKinEmergencyContacts(
    clientToken: string,
    prisonerNumber: string,
  ): Promise<PersonalRelationshipsContact[]> {
    const personalRelationShipsApiClient = this.personalRelationShipsApiClientBuilder(clientToken)
    const queryParams = {
      emergencyContactOrNextOfKin: true,
      isRelationshipActive: true,
      size: 50,
    }

    const response = await personalRelationShipsApiClient.getContacts(prisonerNumber, queryParams)
    return response.content.sort(this.nextOfKinSorter).map(contact => ({
      ...contact,
      relationshipToPrisonerDescription: mapRelationshipDescriptionByCode(
        contact.relationshipToPrisonerCode,
        contact.relationshipToPrisonerDescription,
      ),
    }))
  }

  async getReferenceData(
    clientToken: string,
    domains: PersonalRelationshipsReferenceDataDomain[],
  ): Promise<Record<string, ReferenceDataCodeDto[]>> {
    return Object.fromEntries(
      await Promise.all(
        domains.map(async domain => [
          Object.entries(PersonalRelationshipsReferenceDataDomain).find(([_, value]) => value === domain)?.[0] ??
            domain, // Get enum key name
          await this.referenceDataService.getActiveReferenceDataCodes(domain, clientToken),
        ]),
      ),
    )
  }

  async createContact(clientToken: string, user: PrisonUser, contactRequest: PersonalRelationshipsContactRequest) {
    const personalRelationShipsApiClient = this.personalRelationShipsApiClientBuilder(clientToken)

    const response = await personalRelationShipsApiClient.createContact(contactRequest)

    this.metricsService.trackPersonalRelationshipsUpdate({
      fieldsUpdated: ['nextOfKin'],
      prisonerNumber: contactRequest.relationship.prisonerNumber,
      user,
    })

    return response
  }

  async addContactAddress(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    contactId: number,
    request: PersonalRelationshipsContactRequestAddress,
  ) {
    const personalRelationShipsApiClient = this.personalRelationShipsApiClientBuilder(clientToken)

    const response = await personalRelationShipsApiClient.addContactAddress(contactId, request)

    this.metricsService.trackPersonalRelationshipsUpdate({
      fieldsUpdated: ['nextOfKin'],
      prisonerNumber,
      user,
    })

    return response
  }

  private nextOfKinSorter(a: PersonalRelationshipsContact, b: PersonalRelationshipsContact): number {
    const getPriority = (contact: PersonalRelationshipsContact): number => {
      if (contact.isNextOfKin && !contact.isEmergencyContact) return 1
      if (contact.isNextOfKin && contact.isEmergencyContact) return 2
      if (!contact.isNextOfKin && contact.isEmergencyContact) return 3
      return 4 // fallback for any other cases
    }

    const priorityOrder = getPriority(a) - getPriority(b)
    if (priorityOrder !== 0) {
      return priorityOrder
    }

    return a.firstName.localeCompare(b.firstName)
  }
}
