import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import PersonalPage, {
  Addresses,
  IdentityNumbers,
  PersonalDetails,
  PhysicalCharacteristics,
  PropertyItem,
} from './interfaces/personalPageService/PersonalPage'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import {
  addressToLines,
  calculateAge,
  convertToTitleCase,
  formatHeight,
  formatName,
  formatWeight,
  neurodiversityEnabled,
  sortByDateTime,
} from '../utils/utils'
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
import { CuriousRestClientBuilder, RestClientBuilder } from '../data'
import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'
import MetricsService from './metrics/metricsService'
import { Result } from '../utils/result/result'
import {
  CorePersonPhysicalAttributesRequest,
  CorePersonRecordReferenceDataDomain,
  PersonIntegrationApiClient,
  PersonIntegrationDistinguishingMark,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import LearnerNeurodivergence from '../data/interfaces/curiousApi/LearnerNeurodivergence'
import ReferenceDataService from './referenceData/referenceDataService'
import {
  DietAndAllergy,
  DietAndAllergyUpdate,
  HealthAndMedication,
  HealthAndMedicationApiClient,
  ReferenceDataCode,
  ValueWithMetadata,
} from '../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { militaryHistoryEnabled } from '../utils/featureToggles'
import { ReferenceDataDomain } from '../data/interfaces/referenceData'
import BadRequestError from '../utils/badRequestError'
import { CuriousApiToken } from '../data/hmppsAuthClient'
import { CorePersonPhysicalAttributes } from './interfaces/corePerson/corePersonPhysicalAttributes'
import logger from '../../logger'
import PrisonService from './prisonService'
import { Prison } from './interfaces/prisonService/PrisonServicePrisons'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsContact,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

export default class PersonalPageService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly curiousApiClientBuilder: CuriousRestClientBuilder<CuriousApiClient>,
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    private readonly healthAndMedicationApiClientBuilder: RestClientBuilder<HealthAndMedicationApiClient>,
    private readonly referenceDataService: ReferenceDataService,
    private readonly prisonService: PrisonService,
    private readonly metricsService: MetricsService,
    private readonly curiousApiTokenBuilder: () => Promise<CuriousApiToken>,
    private readonly personalRelationshipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient>,
  ) {}

  async getHealthAndMedication(token: string, prisonerNumber: string): Promise<HealthAndMedication> {
    const apiClient = this.healthAndMedicationApiClientBuilder(token)
    return apiClient.getHealthAndMedication(prisonerNumber)
  }

  async updateDietAndFoodAllergies(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    dietAndFoodAllergies: Partial<DietAndAllergyUpdate>,
  ): Promise<DietAndAllergy> {
    const apiClient = this.healthAndMedicationApiClientBuilder(token)
    const response = apiClient.updateDietAndAllergyData(prisonerNumber, dietAndFoodAllergies)

    this.metricsService.trackHealthAndMedicationUpdate({
      fieldsUpdated: Object.keys(dietAndFoodAllergies),
      prisonerNumber,
      user,
    })

    return response
  }

  async getDistinguishingMarks(token: string, prisonerNumber: string): Promise<PersonIntegrationDistinguishingMark[]> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    return apiClient.getDistinguishingMarks(prisonerNumber)
  }

  async getPhysicalAttributes(token: string, prisonerNumber: string): Promise<CorePersonPhysicalAttributes> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const physicalAttributesDto = await apiClient.getPhysicalAttributes(prisonerNumber)
    return {
      height: physicalAttributesDto.height,
      weight: physicalAttributesDto.weight,
      hairCode: physicalAttributesDto.hair?.code,
      hairDescription: physicalAttributesDto.hair?.description,
      facialHairCode: physicalAttributesDto.facialHair?.code,
      facialHairDescription: physicalAttributesDto.facialHair?.description,
      faceCode: physicalAttributesDto.face?.code,
      faceDescription: physicalAttributesDto.face?.description,
      buildCode: physicalAttributesDto.build?.code,
      buildDescription: physicalAttributesDto.build?.description,
      leftEyeColourCode: physicalAttributesDto.leftEyeColour?.code,
      leftEyeColourDescription: physicalAttributesDto.leftEyeColour?.description,
      rightEyeColourCode: physicalAttributesDto.rightEyeColour?.code,
      rightEyeColourDescription: physicalAttributesDto.rightEyeColour?.description,
      shoeSize: physicalAttributesDto.shoeSize,
    }
  }

  async updatePhysicalAttributes(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    physicalAttributes: CorePersonPhysicalAttributesRequest,
  ) {
    const apiClient = this.personIntegrationApiClientBuilder(token)

    const existingPhysicalAttributes =
      (await this.getPhysicalAttributes(token, prisonerNumber)) ??
      (() => {
        throw new BadRequestError(`Physical attributes not found for ${prisonerNumber}`)
      })()

    await apiClient.updatePhysicalAttributes(prisonerNumber, {
      ...existingPhysicalAttributes,
      ...physicalAttributes,
    })

    this.metricsService.trackPrisonPersonUpdate({
      fieldsUpdated: Object.keys(physicalAttributes),
      prisonerNumber,
      user,
    })
  }

  public async get(
    token: string,
    prisonerData: Prisoner,
    dietAndAllergyIsEnabled: boolean = false,
    editProfileEnabled: boolean = false,
    apiErrorCallback: (error: Error) => void = () => null,
    flashMessage: { fieldName: string } = null,
  ): Promise<PersonalPage> {
    const prisonApiClient = this.prisonApiClientBuilder(token)
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(token)
    const personalRelationsipsApiClient = this.personalRelationshipsApiClientBuilder(token)

    const { bookingId, prisonerNumber, prisonId } = prisonerData
    const [
      inmateDetail,
      prisonerDetail,
      secondaryLanguages,
      property,
      addressList,
      identifiers,
      beliefs,
      distinguishingMarks,
      learnerNeurodivergence,
      healthAndMedication,
      militaryRecords,
      physicalAttributes,
      personalRelationshipContacts,
    ] = await Promise.all([
      prisonApiClient.getInmateDetail(bookingId),
      prisonApiClient.getPrisoner(prisonerNumber),
      prisonApiClient.getSecondaryLanguages(bookingId),
      prisonApiClient.getProperty(bookingId),
      prisonApiClient.getAddresses(prisonerNumber),
      prisonApiClient.getIdentifiers(prisonerNumber),
      prisonApiClient.getBeliefHistory(prisonerNumber),
      editProfileEnabled ? this.getDistinguishingMarks(token, prisonerNumber) : null,
      Result.wrap(this.getLearnerNeurodivergence(prisonId, prisonerNumber), apiErrorCallback),
      dietAndAllergyIsEnabled ? this.getHealthAndMedication(token, prisonerNumber) : null,
      militaryHistoryEnabled() ? this.getMilitaryRecords(token, prisonerNumber) : null,
      this.getPhysicalAttributes(token, prisonerNumber),
      personalRelationsipsApiClient.getContacts(prisonerNumber, {
        isRelationshipActive: true,
        emergencyContactOrNextOfKin: true,
        size: 100,
      }),
    ])

    const nextOfKinAndEmergencyContacts = personalRelationshipContacts.content.sort(this.nextOfKinSorter)

    const addresses: Addresses = this.addresses(addressList)
    const countryOfBirth =
      inmateDetail.birthCountryCode &&
      (await this.getReferenceData(token, CorePersonRecordReferenceDataDomain.country, inmateDetail.birthCountryCode))
        .description

    return {
      personalDetails: await this.personalDetails(
        id => this.prisonService.getPrisonByPrisonId(id, token),
        personIntegrationApiClient,
        prisonerData,
        inmateDetail,
        prisonerDetail,
        secondaryLanguages,
        countryOfBirth,
        healthAndMedication,
        flashMessage,
      ),
      identityNumbers: this.identityNumbers(prisonerData, identifiers),
      property: this.property(property),
      addresses,
      addressSummary: this.addressSummary(addresses),
      nextOfKinAndEmergencyContacts,
      hasNextOfKin: nextOfKinAndEmergencyContacts.some(contact => contact.isNextOfKin),
      hasEmergencyContact: nextOfKinAndEmergencyContacts.some(contact => contact.isEmergencyContact),
      physicalCharacteristics: this.physicalCharacteristics(inmateDetail, physicalAttributes),
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
      learnerNeurodivergence,
      hasCurrentBelief: beliefs?.some(belief => belief.bookingId === bookingId),
      distinguishingMarks,
      militaryRecords: militaryRecords?.filter(record => record.militarySeq === 1), // Temporary fix to only show the first military record - designs for multiple not ready yet
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

  private async personalDetails(
    prison: (prisonId: string) => Promise<Prison>,
    personIntegrationApiClient: PersonIntegrationApiClient,
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    prisonerDetail: PrisonerDetail,
    secondaryLanguages: SecondaryLanguage[],
    countryOfBirth: string,
    healthAndMedication: HealthAndMedication,
    flashMessage: { fieldName: string },
  ): Promise<PersonalDetails> {
    const { profileInformation } = inmateDetail

    const aliases = await this.aliases(personIntegrationApiClient, prisonerData, flashMessage)

    let ethnicGroup = 'Not entered'
    if (prisonerDetail?.ethnicity) {
      ethnicGroup = `${prisonerDetail.ethnicity}`
      if (prisonerDetail?.ethnicityCode) {
        ethnicGroup += ` (${prisonerDetail.ethnicityCode})`
      }
    }

    const nationality =
      inmateDetail?.profileInformation?.find(entry => entry.type === 'NAT')?.resultValue || 'Not entered'

    const formatNumberOfChildren = (count: string) => {
      if (count === null) return 'Not entered'
      if (count === '0') return 'None'
      return count
    }

    const foodAllergyAndDietLatestUpdate = this.latestModificationDetails(healthAndMedication)
    const lastUpdatedAgency = foodAllergyAndDietLatestUpdate.lastModifiedPrisonId
      ? await prison(foodAllergyAndDietLatestUpdate.lastModifiedPrisonId)
      : null

    return {
      age: calculateAge(prisonerData.dateOfBirth),
      aliases,
      dateOfBirth: formatDate(inmateDetail.dateOfBirth, 'short'),
      domesticAbusePerpetrator: getProfileInformationValue(
        ProfileInformationType.DomesticAbusePerpetrator,
        profileInformation,
      ),
      domesticAbuseVictim: getProfileInformationValue(ProfileInformationType.DomesticAbuseVictim, profileInformation),
      cityOrTownOfBirth: inmateDetail.birthPlace ? convertToTitleCase(inmateDetail.birthPlace) : 'Not entered',
      countryOfBirth: countryOfBirth ? convertToTitleCase(countryOfBirth) : 'Not entered',
      ethnicGroup,
      fullName: formatName(inmateDetail.firstName, inmateDetail.middleName, inmateDetail.lastName),
      languages: {
        interpreterRequired: inmateDetail.interpreterRequired,
        spoken: inmateDetail.language,
        written: inmateDetail.writtenLanguage,
      },
      marriageOrCivilPartnership: prisonerData.maritalStatus || 'Not entered',
      nationality,
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
      preferredName: formatName(
        prisonerDetail?.currentWorkingFirstName,
        undefined,
        prisonerDetail?.currentWorkingLastName,
      ),
      religionOrBelief: inmateDetail.religion || 'Not entered',
      sex: prisonerData.gender,
      sexualOrientation:
        getProfileInformationValue(ProfileInformationType.SexualOrientation, profileInformation) || 'Not entered',
      smokerOrVaper:
        getProfileInformationValue(ProfileInformationType.SmokerOrVaper, profileInformation) || 'Not entered',
      socialCareNeeded: getProfileInformationValue(ProfileInformationType.SocialCareNeeded, profileInformation),
      typeOfDiet: getProfileInformationValue(ProfileInformationType.TypesOfDiet, profileInformation) || 'Not entered',
      youthOffender: prisonerData.youthOffender ? 'Yes' : 'No',
      dietAndAllergy: {
        foodAllergies: this.mapDietAndAllergy(healthAndMedication, 'foodAllergies'),
        medicalDietaryRequirements: this.mapDietAndAllergy(healthAndMedication, 'medicalDietaryRequirements'),
        personalisedDietaryRequirements: this.mapDietAndAllergy(healthAndMedication, 'personalisedDietaryRequirements'),
        cateringInstructions: healthAndMedication?.dietAndAllergy?.cateringInstructions?.value ?? '',
        lastModifiedAt: formatDate(foodAllergyAndDietLatestUpdate.lastModifiedAt),
        lastModifiedPrison: lastUpdatedAgency?.prisonName ?? '',
      },
    }
  }

  private aliases = async (
    personIntegrationApiClient: PersonIntegrationApiClient,
    prisonerData: Prisoner,
    flashMessage: { fieldName: string },
  ) => {
    if (flashMessage?.fieldName === 'fullName' || flashMessage?.fieldName === 'aliases') {
      try {
        logger.debug('Retrieving aliases from Person Integration API after update')

        const pseudonyms = await personIntegrationApiClient.getPseudonyms(prisonerData.prisonerNumber)
        return pseudonyms
          .filter(pseudonym => !pseudonym.isWorkingName)
          .map(({ firstName, middleName1, middleName2, lastName, dateOfBirth, sex }) => ({
            alias: formatName(firstName, [middleName1, middleName2].join(' ').trim(), lastName),
            dateOfBirth: formatDate(dateOfBirth, 'short'),
            sex: sex.description,
          }))
      } catch (error) {
        logger.error('Failed to retrieve aliases from Person Integration API', error)
      }
    }

    return prisonerData.aliases?.map(({ firstName, middleNames, lastName, dateOfBirth, gender }) => ({
      alias: formatName(firstName, middleNames, lastName),
      dateOfBirth: formatDate(dateOfBirth, 'short'),
      sex: gender,
    }))
  }

  private mapDietAndAllergy = (
    healthAndMedication: HealthAndMedication,
    field: keyof Omit<DietAndAllergy, 'cateringInstructions'>,
  ) => {
    const dietAndAllergy = healthAndMedication?.dietAndAllergy

    return (
      (dietAndAllergy &&
        dietAndAllergy[field]?.value
          ?.map(({ value: { id, description }, comment }) => ({ id, description, comment }))
          .sort((a, b) => {
            if (a.id?.endsWith('OTHER')) return 1
            if (b.id?.endsWith('OTHER')) return -1
            return a.description.localeCompare(b.description)
          })) ??
      []
    )
  }

  private latestModificationDetails = (healthAndMedication: HealthAndMedication) => {
    const dietAndAllergy = healthAndMedication?.dietAndAllergy

    const metadata = (dietAndAllergy ? Object.values(dietAndAllergy) : null) as ValueWithMetadata<
      string | ReferenceDataCode[]
    >[]

    const mostRecentUpdate =
      metadata?.sort((a, b) => {
        if (!a) return 1
        if (!b) return -1
        return sortByDateTime(b.lastModifiedAt, a.lastModifiedAt)
      })[0] ?? null

    return {
      lastModifiedAt: mostRecentUpdate?.lastModifiedAt,
      lastModifiedPrisonId: mostRecentUpdate?.lastModifiedPrisonId,
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

  private physicalCharacteristics(
    inmateDetail: InmateDetail,
    physicalAttributes: CorePersonPhysicalAttributes,
  ): PhysicalCharacteristics {
    return {
      height: formatHeight(physicalAttributes.height),
      weight: formatWeight(physicalAttributes.weight),
      build: physicalAttributes.buildDescription || 'Not entered',
      distinguishingMarks:
        inmateDetail.physicalMarks?.map(({ bodyPart, comment, imageId, side, orentiation, type }) => ({
          bodyPart,
          comment,
          imageId,
          side,
          orientation: orentiation,
          type,
        })) || [],
      facialHair: physicalAttributes.facialHairDescription || 'Not entered',
      hairColour: physicalAttributes.hairDescription || 'Not entered',
      leftEyeColour: physicalAttributes.leftEyeColourDescription || 'Not entered',
      rightEyeColour: physicalAttributes.rightEyeColourDescription || 'Not entered',
      shapeOfFace: physicalAttributes.faceDescription || 'Not entered',
      shoeSize: physicalAttributes.shoeSize || 'Not entered',
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

  async getLearnerNeurodivergence(prisonId: string, prisonerNumber: string): Promise<LearnerNeurodivergence[]> {
    if (!neurodiversityEnabled(prisonId)) return Promise.resolve([])
    const curiousApiToken = await this.curiousApiTokenBuilder()
    const curiousApiClient = this.curiousApiClientBuilder(curiousApiToken)
    return curiousApiClient.getLearnerNeurodivergence(prisonerNumber)
  }

  async getReferenceDataCodes(clientToken: string, domain: ReferenceDataDomain) {
    return this.referenceDataService.getActiveReferenceDataCodes(domain, clientToken)
  }

  async getReferenceData(clientToken: string, domain: CorePersonRecordReferenceDataDomain, code: string) {
    return this.referenceDataService.getReferenceData(domain, code.toUpperCase(), clientToken)
  }

  async updateSmokerOrVaper(clientToken: string, user: PrisonUser, prisonerNumber: string, smokerOrVaper: string) {
    const healthAndMedicationApiClient = this.healthAndMedicationApiClientBuilder(clientToken)
    const response = await healthAndMedicationApiClient.updateSmokerStatus(prisonerNumber, {
      smokerStatus: smokerOrVaper,
    })

    this.metricsService.trackPrisonPersonUpdate({
      fieldsUpdated: ['smokerOrVaper'],
      prisonerNumber,
      user,
    })

    return response
  }

  async updateCityOrTownOfBirth(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    cityOrTownOfBirth: string,
  ) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const response = await personIntegrationApiClient.updateBirthPlace(prisonerNumber, cityOrTownOfBirth)

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['cityOrTownOfBirth'],
      prisonerNumber,
      user,
    })

    return response
  }

  async updateCountryOfBirth(clientToken: string, user: PrisonUser, prisonerNumber: string, countryOfBirth: string) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const response = await personIntegrationApiClient.updateCountryOfBirth(prisonerNumber, countryOfBirth)

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['countryOfBirth'],
      prisonerNumber,
      user,
    })

    return response
  }

  async updateNationality(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    nationality: string,
    otherNationalities: string,
  ) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const response = await personIntegrationApiClient.updateNationality(prisonerNumber, nationality, otherNationalities)

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['nationality', 'otherNationalities'],
      prisonerNumber,
      user,
    })

    return response
  }

  async updateReligion(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    religionCode: string,
    reasonForChange?: string,
  ) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const response = await personIntegrationApiClient.updateReligion(prisonerNumber, religionCode, reasonForChange)

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['religion'],
      prisonerNumber,
      user,
    })

    return response
  }

  async updateSexualOrientation(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    sexualOrientation: string,
  ) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    const response = await personIntegrationApiClient.updateSexualOrientation(prisonerNumber, sexualOrientation)

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['sexualOrientation'],
      prisonerNumber,
      user,
    })

    return response
  }

  async getMilitaryRecords(clientToken: string, prisonerNumber: string) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    return personIntegrationApiClient.getMilitaryRecords(prisonerNumber)
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
