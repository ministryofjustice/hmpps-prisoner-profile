import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import PersonalPage, {
  Addresses,
  IdentityNumbers,
  NextOfKin,
  PersonalDetails,
  PhysicalCharacteristics,
  PropertyItem,
} from './interfaces/personalPageService/PersonalPage'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { addressToLines, calculateAge, camelToSnakeCase, formatHeight, formatName, formatWeight } from '../utils/utils'
import { getProfileInformationValue, ProfileInformationType } from '../data/interfaces/prisonApi/ProfileInformation'
import OffenderIdentifier, {
  getOffenderIdentifierValue,
  OffenderIdentifierType,
} from '../data/interfaces/prisonApi/OffenderIdentifier'
import Address from '../data/interfaces/prisonApi/Address'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import SecondaryLanguage from '../data/interfaces/prisonApi/SecondaryLanguage'
import PrisonerDetail from '../data/interfaces/prisonApi/PrisonerDetail'
import PropertyContainer from '../data/interfaces/prisonApi/PropertyContainer'
import { formatDate } from '../utils/dateHelpers'
import { getMostRecentAddress } from '../utils/getMostRecentAddress'
import GovSummaryItem from '../interfaces/GovSummaryItem'
import { RestClientBuilder } from '../data'
import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import { OffenderContacts } from '../data/interfaces/prisonApi/OffenderContact'
import {
  PrisonPersonDistinguishingMark,
  PrisonPerson,
  PrisonPersonApiClient,
  PrisonPersonPhysicalAttributesUpdate,
} from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'
import MetricsService from './metrics/metricsService'

export default class PersonalPageService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly curiousApiClientBuilder: RestClientBuilder<CuriousApiClient>,
    private readonly prisonPersonApiClientBuilder: RestClientBuilder<PrisonPersonApiClient>,
    private readonly metricsService: MetricsService,
  ) {}

  async getPrisonPerson(token: string, prisonerNumber: string, enablePrisonPerson: boolean): Promise<PrisonPerson> {
    if (enablePrisonPerson) {
      const apiClient = this.prisonPersonApiClientBuilder(token)
      return apiClient.getPrisonPerson(prisonerNumber)
    }
    return null
  }

  async getDistinguishingMarks(token: string, prisonerNumber: string): Promise<PrisonPersonDistinguishingMark[]> {
    const apiClient = this.prisonPersonApiClientBuilder(token)
    return apiClient.getDistinguishingMarks(prisonerNumber)
  }

  async updatePhysicalAttributes(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    physicalAttributes: Partial<PrisonPersonPhysicalAttributesUpdate>,
  ) {
    const apiClient = this.prisonPersonApiClientBuilder(token)
    const response = await apiClient.updatePhysicalAttributes(prisonerNumber, physicalAttributes)

    this.metricsService.trackPrisonPersonUpdate({
      fieldsUpdated: Object.keys(physicalAttributes),
      prisonerNumber,
      user,
    })

    return response
  }

  public async get(token: string, prisonerData: Prisoner, enablePrisonPerson: boolean = false): Promise<PersonalPage> {
    const prisonApiClient = this.prisonApiClientBuilder(token)

    const { bookingId, prisonerNumber } = prisonerData
    const [
      inmateDetail,
      prisonerDetail,
      secondaryLanguages,
      property,
      addressList,
      contacts,
      identifiers,
      beliefs,
      prisonPerson,
      distinguishingMarks,
    ] = await Promise.all([
      prisonApiClient.getInmateDetail(bookingId),
      prisonApiClient.getPrisoner(prisonerNumber),
      prisonApiClient.getSecondaryLanguages(bookingId),
      prisonApiClient.getProperty(bookingId),
      prisonApiClient.getAddresses(prisonerNumber),
      prisonApiClient.getOffenderContacts(prisonerNumber),
      prisonApiClient.getIdentifiers(prisonerNumber),
      prisonApiClient.getBeliefHistory(prisonerNumber),
      this.getPrisonPerson(token, prisonerNumber, enablePrisonPerson),
      enablePrisonPerson ? this.getDistinguishingMarks(token, prisonerNumber) : null,
    ])

    const addresses: Addresses = this.addresses(addressList)
    return {
      personalDetails: this.personalDetails(
        prisonerData,
        inmateDetail,
        prisonerDetail,
        secondaryLanguages,
        prisonPerson,
      ),
      identityNumbers: this.identityNumbers(prisonerData, identifiers),
      property: this.property(property),
      addresses,
      addressSummary: this.addressSummary(addresses),
      nextOfKin: await this.nextOfKin(contacts, prisonApiClient),
      physicalCharacteristics: this.physicalCharacteristics(prisonerData, inmateDetail, prisonPerson),
      security: {
        interestToImmigration: getProfileInformationValue(
          ProfileInformationType.InterestToImmigration,
          inmateDetail.profileInformation,
        ),
        travelRestrictions: getProfileInformationValue(
          ProfileInformationType.TravelRestrictions,
          inmateDetail.profileInformation,
        ),
      },
      learnerNeurodivergence: await this.getLearnerNeurodivergence(token, prisonerNumber),
      hasCurrentBelief: beliefs?.some(belief => belief.bookingId === bookingId),
      showFieldHistoryLink: !!prisonPerson,
      distinguishingMarks,
    }
  }

  private addressSummary(addresses: Addresses): GovSummaryItem[] {
    const addressSummary: GovSummaryItem[] = []

    if (addresses) {
      addressSummary.push({
        key: { text: 'Address' },
        value: { html: addressToLines(addresses.address).join('<br/>') },
        classes: 'govuk-summary-list__row--no-border',
      })
      addressSummary.push({
        key: { text: 'Type of address' },
        value: { html: addresses.addressTypes.join('<br/>') },
      })
      addressSummary.push({
        key: { text: 'Phone' },
        value: { html: addresses.phones?.length ? addresses.phones.join('<br/>') : 'Not entered' },
      })
      if (addresses.comment) {
        addressSummary.push({
          key: { text: 'Comment' },
          value: { text: addresses.comment },
        })
      }
    }

    return addressSummary
  }

  private personalDetails(
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    prisonerDetail: PrisonerDetail,
    secondaryLanguages: SecondaryLanguage[],
    prisonPerson: PrisonPerson,
  ): PersonalDetails {
    const { profileInformation } = inmateDetail

    const aliases = prisonerData.aliases?.map(({ firstName, middleNames, lastName, dateOfBirth }) => ({
      alias: formatName(firstName, middleNames, lastName),
      dateOfBirth: formatDate(dateOfBirth, 'short'),
    }))

    let ethnicGroup = 'Not entered'
    if (prisonerDetail?.ethnicity) {
      ethnicGroup = `${prisonerDetail.ethnicity}`
      if (prisonerDetail?.ethnicityCode) {
        ethnicGroup += ` (${prisonerDetail.ethnicityCode})`
      }
    }

    const formatNumberOfChildren = (count: string) => {
      if (count === null) return 'Not entered'
      if (count === '0') return 'None'
      return count
    }

    return {
      age: calculateAge(prisonerData.dateOfBirth),
      aliases,
      dateOfBirth: formatDate(prisonerData.dateOfBirth, 'short'),
      domesticAbusePerpetrator: getProfileInformationValue(
        ProfileInformationType.DomesticAbusePerpetrator,
        profileInformation,
      ),
      domesticAbuseVictim: getProfileInformationValue(ProfileInformationType.DomesticAbuseVictim, profileInformation),
      ethnicGroup,
      fullName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
      languages: {
        interpreterRequired: inmateDetail.interpreterRequired,
        spoken: inmateDetail.language,
        written: inmateDetail.writtenLanguage,
      },
      marriageOrCivilPartnership: prisonerData.maritalStatus || 'Not entered',
      nationality: prisonerData.nationality || 'Not entered',
      numberOfChildren: formatNumberOfChildren(
        getProfileInformationValue(ProfileInformationType.NumberOfChildren, profileInformation),
      ),
      otherLanguages: secondaryLanguages.map(({ description, canRead, canSpeak, canWrite, code }) => ({
        language: description,
        code,
        canRead,
        canSpeak,
        canWrite,
      })),
      otherNationalities: getProfileInformationValue(ProfileInformationType.OtherNationalities, profileInformation),
      placeOfBirth: inmateDetail.birthPlace || 'Not entered',
      preferredName: formatName(
        prisonerDetail?.currentWorkingFirstName,
        undefined,
        prisonerDetail?.currentWorkingLastName,
      ),
      religionOrBelief: prisonerData.religion || 'Not entered',
      sex: prisonerData.gender,
      sexualOrientation:
        getProfileInformationValue(ProfileInformationType.SexualOrientation, profileInformation) || 'Not entered',
      smokerOrVaper: prisonPerson
        ? prisonPerson.health?.smokerOrVaper?.value?.description || 'Not entered'
        : getProfileInformationValue(ProfileInformationType.SmokerOrVaper, profileInformation) || 'Not entered',
      socialCareNeeded: getProfileInformationValue(ProfileInformationType.SocialCareNeeded, profileInformation),
      typeOfDiet: getProfileInformationValue(ProfileInformationType.TypesOfDiet, profileInformation) || 'Not entered',
      youthOffender: prisonerData.youthOffender ? 'Yes' : 'No',
      medicalDietaryRequirements: prisonPerson
        ? prisonPerson.health?.medicalDietaryRequirements.map(x => x.description)
        : [],
      foodAllergies: prisonPerson ? prisonPerson.health?.foodAllergies.map(x => x.description) : [],
    }
  }

  private identityNumbers(prisonerData: Prisoner, identifiers: OffenderIdentifier[]): IdentityNumbers {
    return {
      croNumber: getOffenderIdentifierValue(OffenderIdentifierType.CroNumber, identifiers),
      drivingLicenceNumber: getOffenderIdentifierValue(OffenderIdentifierType.DrivingLicenseNumber, identifiers),
      homeOfficeReferenceNumber: getOffenderIdentifierValue(
        OffenderIdentifierType.HomeOfficeReferenceNumber,
        identifiers,
      ),
      nationalInsuranceNumber: getOffenderIdentifierValue(OffenderIdentifierType.NationalInsuranceNumber, identifiers),
      pncNumber: getOffenderIdentifierValue(OffenderIdentifierType.PncNumber, identifiers),
      prisonNumber: prisonerData.prisonerNumber,
      caseInformationDatabase: getOffenderIdentifierValue(OffenderIdentifierType.CaseInformationDatabase, identifiers),
      prisonLegacySystemNumber: getOffenderIdentifierValue(
        OffenderIdentifierType.PrisonLegacySystemNumber,
        identifiers,
      ),
      localInmateDataSystemNumber: getOffenderIdentifierValue(
        OffenderIdentifierType.LocalInmateDataSystemNumber,
        identifiers,
      ),
      passportNumber: getOffenderIdentifierValue(OffenderIdentifierType.PassportNumber, identifiers),
      parkrunNumber: getOffenderIdentifierValue(OffenderIdentifierType.ParkrunNumber, identifiers),
      probationLegacySystemNumber: getOffenderIdentifierValue(
        OffenderIdentifierType.ProbationLegacySystemNumber,
        identifiers,
      ),
      portReferenceNumber: getOffenderIdentifierValue(OffenderIdentifierType.PortReferenceNumber, identifiers),
      scottishPncNumber: getOffenderIdentifierValue(OffenderIdentifierType.ScottishPncNumber, identifiers),
      staffIdentityCardNumber: getOffenderIdentifierValue(OffenderIdentifierType.StaffIdentityCardNumber, identifiers),
      didNotEnterPrisonTaggedBailRel: getOffenderIdentifierValue(
        OffenderIdentifierType.DidNotEnterPrisonTaggedBailRel,
        identifiers,
      ),
      uniqueLearnerNumber: getOffenderIdentifierValue(OffenderIdentifierType.UniqueLearnerNumber, identifiers),
      yjafNumber: getOffenderIdentifierValue(OffenderIdentifierType.YjafNumber, identifiers),
    }
  }

  private property(property: PropertyContainer[]): PropertyItem[] {
    if (!Array.isArray(property)) {
      return []
    }
    return property.map(({ location, containerType, sealMark }) => ({
      containerType,
      sealMark: sealMark || 'Not entered',
      location: location?.userDescription || 'Not entered',
    }))
  }

  private addresses(addresses: Address[]): Addresses | undefined {
    if (!Array.isArray(addresses)) {
      return undefined
    }

    const mostRecentAddress = getMostRecentAddress(addresses)

    return {
      isPrimaryAddress: !!mostRecentAddress,
      noFixedAddress: mostRecentAddress?.noFixedAddress,
      comment: mostRecentAddress?.comment,
      phones: mostRecentAddress?.phones.map(phone => phone.number) || [],
      addressTypes:
        mostRecentAddress?.addressUsages
          .filter(usage => usage.activeFlag && usage.activeFlag)
          .map(usage => usage.addressUsageDescription) || [],
      address: {
        country: mostRecentAddress?.country || '',
        county: mostRecentAddress?.county || '',
        flat: mostRecentAddress?.flat || '',
        locality: mostRecentAddress?.locality || '',
        postalCode: mostRecentAddress?.postalCode || '',
        premise: mostRecentAddress?.premise || '',
        street: mostRecentAddress?.street || '',
        town: mostRecentAddress?.town || '',
      },
      addedOn: mostRecentAddress?.startDate || '',
    }
  }

  private async nextOfKin(contacts: OffenderContacts, prisonApiClient: PrisonApiClient): Promise<NextOfKin[]> {
    const activeNextOfKinContacts = contacts.offenderContacts?.filter(contact => contact.active && contact.nextOfKin)
    let contactAddresses: { personId: number; addresses: Address[] }[] = []
    if (activeNextOfKinContacts) {
      contactAddresses = await Promise.all(
        activeNextOfKinContacts.map(contact => this.addressForPerson(contact.personId, prisonApiClient)),
      )
    }

    return contacts.offenderContacts
      ?.filter(contact => contact.nextOfKin && contact.active)
      .map(contact => {
        const personAddresses = contactAddresses.find(address => address.personId === contact.personId)
        return {
          address: this.addresses(personAddresses.addresses),
          emails: contact.emails?.map(({ email }) => email) || [],
          emergencyContact: contact.emergencyContact,
          name: formatName(contact.firstName, contact.middleName, contact.lastName),
          nextOfKin: contact.nextOfKin,
          phones: contact.phones?.map(({ number }) => number),
          relationship: contact.relationshipDescription,
        }
      })
  }

  private async addressForPerson(
    personId: number,
    prisonApiClient: PrisonApiClient,
  ): Promise<{ personId: number; addresses: Address[] }> {
    const addresses = await prisonApiClient.getAddressesForPerson(personId)
    return { personId, addresses }
  }

  private physicalCharacteristics(
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    prisonPerson: PrisonPerson,
  ): PhysicalCharacteristics {
    return {
      height: formatHeight(
        prisonPerson ? prisonPerson.physicalAttributes?.height?.value : prisonerData.heightCentimetres,
      ),
      weight: formatWeight(
        prisonPerson ? prisonPerson.physicalAttributes?.weight?.value : prisonerData.weightKilograms,
      ),
      build: prisonPerson
        ? prisonPerson.physicalAttributes?.build?.value?.description || 'Not entered'
        : prisonerData.build || 'Not entered',
      distinguishingMarks:
        inmateDetail.physicalMarks?.map(({ bodyPart, comment, imageId, side, orentiation, type }) => ({
          bodyPart,
          comment,
          imageId,
          side,
          orientation: orentiation,
          type,
        })) || [],
      facialHair: prisonPerson
        ? prisonPerson.physicalAttributes?.facialHair?.value?.description || 'Not entered'
        : prisonerData.facialHair || 'Not entered',
      hairColour: prisonPerson
        ? prisonPerson.physicalAttributes?.hair?.value?.description || 'Not entered'
        : prisonerData.hairColour || 'Not entered',
      leftEyeColour: prisonPerson
        ? prisonPerson.physicalAttributes?.leftEyeColour?.value?.description || 'Not entered'
        : prisonerData.leftEyeColour || 'Not entered',
      rightEyeColour: prisonPerson
        ? prisonPerson.physicalAttributes?.rightEyeColour?.value?.description || 'Not entered'
        : prisonerData.rightEyeColour || 'Not entered',
      shapeOfFace: prisonPerson
        ? prisonPerson.physicalAttributes?.face?.value?.description || 'Not entered'
        : prisonerData.shapeOfFace || 'Not entered',
      shoeSize: prisonPerson
        ? prisonPerson.physicalAttributes?.shoeSize?.value || 'Not entered'
        : prisonerData.shoeSize || 'Not entered',
      warnedAboutTattooing:
        getProfileInformationValue(ProfileInformationType.WarnedAboutTattooing, inmateDetail.profileInformation) ||
        'Needs to be warned',
      warnedNotToChangeAppearance:
        getProfileInformationValue(
          ProfileInformationType.WarnedNotToChangeAppearance,
          inmateDetail.profileInformation,
        ) || 'Needs to be warned',
    }
  }

  getLearnerNeurodivergence(clientToken: string, prisonerNumber: string) {
    const curiousApiClient = this.curiousApiClientBuilder(clientToken)
    return curiousApiClient.getLearnerNeurodivergence(prisonerNumber)
  }

  async getReferenceDataCodes(clientToken: string, domain: string) {
    const prisonPersonApiClient = this.prisonPersonApiClientBuilder(clientToken)
    return prisonPersonApiClient.getReferenceDataCodes(camelToSnakeCase(domain))
  }

  async getReferenceDataDomain(clientToken: string, domain: string) {
    const prisonPersonApiClient = this.prisonPersonApiClientBuilder(clientToken)
    return prisonPersonApiClient.getReferenceDataDomain(camelToSnakeCase(domain))
  }

  async updateSmokerOrVaper(clientToken: string, user: PrisonUser, prisonerNumber: string, smokerOrVaper: string) {
    const prisonPersonApiClient = this.prisonPersonApiClientBuilder(clientToken)
    const response = prisonPersonApiClient.updateHealth(prisonerNumber, { smokerOrVaper })

    this.metricsService.trackPrisonPersonUpdate({
      fieldsUpdated: ['smokerOrVaper'],
      prisonerNumber,
      user,
    })

    return response
  }

  async updateMedicalDietaryRequirements(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    medicalDietaryRequirements: string[],
  ) {
    const prisonPersonApiClient = this.prisonPersonApiClientBuilder(clientToken)
    const response = prisonPersonApiClient.updateHealth(prisonerNumber, { medicalDietaryRequirements })
    this.metricsService.trackPrisonPersonUpdate({
      fieldsUpdated: ['medicalDietaryRequirements'],
      prisonerNumber,
      user,
    })

    return response
  }

  async updateFoodAllergies(clientToken: string, user: PrisonUser, prisonerNumber: string, foodAllergies: string[]) {
    const prisonPersonApiClient = this.prisonPersonApiClientBuilder(clientToken)
    const response = prisonPersonApiClient.updateHealth(prisonerNumber, { foodAllergies })

    this.metricsService.trackPrisonPersonUpdate({
      fieldsUpdated: ['foodAllergies'],
      prisonerNumber,
      user,
    })

    return response
  }

  async updateCityOrTownOfBirth(
    _clientToken: string,
    _user: PrisonUser,
    _prisonerNumber: string,
    _cityOrTownOfBirth: string,
  ) {
    // TODO: Call new Prison API edit endpoint
  }
}
