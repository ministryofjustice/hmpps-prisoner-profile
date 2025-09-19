import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import PersonalPage, {
  GlobalEmail,
  GlobalNumbersAndEmails,
  IdentityNumbers,
  NextOfKin,
  OldAddresses,
  PersonalDetails,
  PhoneNumber,
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
import OffenderIdentifier, { getOffenderIdentifierValue } from '../data/interfaces/prisonApi/OffenderIdentifier'
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
import { noCallbackOnErrorBecause, Result } from '../utils/result/result'
import {
  CorePersonPhysicalAttributesDto,
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
import PrisonService from './prisonService'
import { Prison } from './interfaces/prisonService/PrisonServicePrisons'
import NextOfKinService from './nextOfKinService'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsContact,
  PersonalRelationshipsDomesticStatusDto,
  PersonalRelationshipsNumberOfChildrenDto,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import DomesticStatusService from './domesticStatusService'
import { OffenderContacts } from '../data/interfaces/prisonApi/OffenderContact'
import { religionFieldData } from '../controllers/personal/fieldData'
import GlobalPhoneNumberAndEmailAddressesService from './globalPhoneNumberAndEmailAddressesService'
import { OffenderIdentifierType } from '../data/interfaces/prisonApi/OffenderIdentifierType'
import AddressService from './addressService'

interface PersonalPageGetOptions {
  dietAndAllergyIsEnabled: boolean
  editProfileEnabled: boolean
  personalRelationshipsApiReadEnabled: boolean
  healthAndMedicationApiReadEnabled: boolean
  personEndpointsEnabled: boolean
  apiErrorCallback: (error: Error) => void
}

export default class PersonalPageService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly curiousApiClientBuilder: CuriousRestClientBuilder<CuriousApiClient>,
    private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    private readonly healthAndMedicationApiClientBuilder: RestClientBuilder<HealthAndMedicationApiClient>,
    private readonly personalRelationshipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient>,
    private readonly referenceDataService: ReferenceDataService,
    private readonly prisonService: PrisonService,
    private readonly metricsService: MetricsService,
    private readonly curiousApiTokenBuilder: () => Promise<CuriousApiToken>,
    private readonly nextOfKinService: NextOfKinService,
    private readonly domesticStatusService: DomesticStatusService,
    private readonly globalPhoneNumberAndEmailAddressesService: GlobalPhoneNumberAndEmailAddressesService,
    private readonly addressService: AddressService,
  ) {}

  async getHealthAndMedication(
    token: string,
    prisonerNumber: string,
    {
      dietAndAllergiesEnabled,
      healthAndMedicationApiReadEnabled,
    }: { dietAndAllergiesEnabled: boolean; healthAndMedicationApiReadEnabled: boolean },
  ): Promise<HealthAndMedication | null> {
    if (!dietAndAllergiesEnabled && !healthAndMedicationApiReadEnabled) {
      return null
    }
    const apiClient = this.healthAndMedicationApiClientBuilder(token)
    const response = apiClient.getHealthAndMedication(prisonerNumber)
    return dietAndAllergiesEnabled ? response : null
  }

  async getGlobalPhonesAndEmails(token: string, prisonerNumber: string): Promise<GlobalNumbersAndEmails> {
    return this.globalPhoneNumberAndEmailAddressesService.getForPrisonerNumber(token, prisonerNumber)
  }

  async createGlobalEmail(token: string, prisonerNumber: string, value: string): Promise<GlobalEmail> {
    return this.globalPhoneNumberAndEmailAddressesService.createEmailForPrisonerNumber(token, prisonerNumber, value)
  }

  async updateGlobalEmail(
    token: string,
    prisonerNumber: string,
    emailAddressId: string,
    value: string,
  ): Promise<GlobalEmail> {
    return this.globalPhoneNumberAndEmailAddressesService.updateEmailForPrisonerNumber(
      token,
      prisonerNumber,
      emailAddressId,
      value,
    )
  }

  async createGlobalPhoneNumber(
    token: string,
    prisonerNumber: string,
    values: { phoneNumber: string; phoneNumberType: string; phoneExtension: string },
  ): Promise<PhoneNumber> {
    return this.globalPhoneNumberAndEmailAddressesService.createPhoneNumberForPrisonerNumber(
      token,
      prisonerNumber,
      values,
    )
  }

  async updateGlobalPhoneNumber(
    token: string,
    prisonerNumber: string,
    phoneNumberId: string,
    values: { phoneNumber: string; phoneNumberType: string; phoneExtension: string },
  ): Promise<PhoneNumber> {
    return this.globalPhoneNumberAndEmailAddressesService.updatePhoneNumberForPrisonerNumber(
      token,
      prisonerNumber,
      phoneNumberId,
      values,
    )
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

  private transformPhyscialAttributes(
    physicalAttributesDto: CorePersonPhysicalAttributesDto,
  ): CorePersonPhysicalAttributes {
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

  async getPhysicalAttributes(token: string, prisonerNumber: string): Promise<CorePersonPhysicalAttributes> {
    const apiClient = this.personIntegrationApiClientBuilder(token)
    const physicalAttributesDto = await apiClient.getPhysicalAttributes(prisonerNumber)
    return this.transformPhyscialAttributes(physicalAttributesDto)
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
    options: Partial<PersonalPageGetOptions> = {},
  ): Promise<PersonalPage> {
    const defaultOptions: PersonalPageGetOptions = {
      dietAndAllergyIsEnabled: false,
      editProfileEnabled: false,
      personalRelationshipsApiReadEnabled: true,
      healthAndMedicationApiReadEnabled: false,
      personEndpointsEnabled: false,
      apiErrorCallback: () => null,
    }
    const getOptions: PersonalPageGetOptions = { ...defaultOptions, ...options }

    const prisonApiClient = this.prisonApiClientBuilder(token)
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(token)

    const { bookingId, prisonerNumber, prisonId } = prisonerData
    const [
      inmateDetail,
      prisonerDetail,
      secondaryLanguages,
      property,
      oldAddressList,
      offenderContacts,
      identifiers,
      beliefs,
      learnerNeurodivergence,
      healthAndMedication,
      nextOfKinAndEmergencyContacts,
      personalRelationshipsNumberOfChildren,
      personalRelationshipsDomesticStatus,
    ] = await Promise.all([
      prisonApiClient.getInmateDetail(bookingId),
      prisonApiClient.getPrisoner(prisonerNumber),
      prisonApiClient.getSecondaryLanguages(bookingId),
      prisonApiClient.getProperty(bookingId),
      !getOptions.editProfileEnabled ? prisonApiClient.getAddresses(prisonerNumber) : null,
      prisonApiClient.getOffenderContacts(prisonerNumber),
      prisonApiClient.getIdentifiers(prisonerNumber, getOptions.editProfileEnabled),
      prisonApiClient.getBeliefHistory(prisonerNumber),
      Result.wrap(this.getLearnerNeurodivergence(prisonId, prisonerNumber), getOptions.apiErrorCallback),
      this.getHealthAndMedication(token, prisonerNumber, {
        dietAndAllergiesEnabled: getOptions.dietAndAllergyIsEnabled,
        healthAndMedicationApiReadEnabled: getOptions.healthAndMedicationApiReadEnabled,
      }),
      getOptions.personalRelationshipsApiReadEnabled
        ? Result.wrap(this.getNextOfKinAndEmergencyContacts(token, prisonerNumber), getOptions.apiErrorCallback)
        : Result.rejected<PersonalRelationshipsContact[], Error>(undefined),
      getOptions.personalRelationshipsApiReadEnabled
        ? Result.wrap(
            this.getNumberOfChildren(token, prisonerNumber),
            noCallbackOnErrorBecause('we are falling back to prisoner search data'),
          )
        : Result.rejected<PersonalRelationshipsNumberOfChildrenDto, Error>(undefined),
      getOptions.personalRelationshipsApiReadEnabled
        ? Result.wrap(
            this.getDomesticStatus(token, prisonerNumber),
            noCallbackOnErrorBecause('we are falling back to prison api data'),
          )
        : Result.rejected<PersonalRelationshipsDomesticStatusDto, Error>(undefined),
    ])

    let profileSummary
    let addresses
    let distinguishingMarks
    let militaryRecords
    let physicalAttributes
    let globalNumbersAndEmails
    if (getOptions.personEndpointsEnabled) {
      profileSummary = await personIntegrationApiClient.getPrisonerProfileSummary(prisonerData.prisonerNumber)
      addresses = getOptions.editProfileEnabled
        ? await this.addressService.transformAddresses(token, profileSummary.addresses)
        : null
      distinguishingMarks = getOptions.editProfileEnabled ? profileSummary.distinguishingMarks : null
      militaryRecords = militaryHistoryEnabled() ? profileSummary.militaryRecords : null
      physicalAttributes = this.transformPhyscialAttributes(profileSummary.physicalAttributes)
      globalNumbersAndEmails = getOptions.editProfileEnabled
        ? await this.globalPhoneNumberAndEmailAddressesService.transformContacts(token, profileSummary.contacts)
        : null
    } else {
      ;[addresses, distinguishingMarks, militaryRecords, physicalAttributes, globalNumbersAndEmails] =
        await Promise.all([
          getOptions.editProfileEnabled ? this.addressService.getAddressesForDisplay(token, prisonerNumber) : null,
          getOptions.editProfileEnabled ? this.getDistinguishingMarks(token, prisonerNumber) : null,
          militaryHistoryEnabled() ? this.getMilitaryRecords(token, prisonerNumber) : null,
          this.getPhysicalAttributes(token, prisonerNumber),
          getOptions.editProfileEnabled ? this.getGlobalPhonesAndEmails(token, prisonerNumber) : null,
        ])
    }

    const oldAddresses: OldAddresses = !getOptions.editProfileEnabled && this.oldAddresses(oldAddressList)
    const primaryOrPostalAddresses = addresses?.filter(address => address.primaryAddress || address.postalAddress)

    const countryOfBirth =
      inmateDetail.birthCountryCode &&
      (await this.getReferenceData(token, CorePersonRecordReferenceDataDomain.country, inmateDetail.birthCountryCode))
        .description

    return {
      personalDetails: await this.personalDetails(
        token,
        id => this.prisonService.getPrisonByPrisonId(id, token),
        personIntegrationApiClient,
        prisonerData,
        inmateDetail,
        prisonerDetail,
        secondaryLanguages,
        countryOfBirth,
        healthAndMedication,
        personalRelationshipsNumberOfChildren,
        personalRelationshipsDomesticStatus,
      ),
      identityNumbers: this.identityNumbers(prisonerData, identifiers),
      property: this.property(property),
      addresses: {
        primaryOrPostal: primaryOrPostalAddresses,
        totalActive:
          addresses?.filter(address => !address.toDate || new Date(address.toDate) > new Date())?.length || 0,
      },
      oldAddresses,
      oldAddressSummary: this.addressSummary(oldAddresses),
      nextOfKin: await this.nextOfKin(offenderContacts, prisonApiClient),
      nextOfKinAndEmergencyContacts: nextOfKinAndEmergencyContacts.map(contacts => ({
        contacts,
        hasNextOfKin: contacts.some(contact => contact.isNextOfKin),
        hasEmergencyContact: contacts.some(contact => contact.isEmergencyContact),
      })),
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
      globalNumbersAndEmails,
    }
  }

  // TODO: Remove this once edit profile is live
  private addressSummary(addresses: OldAddresses): GovSummaryItem[] {
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
    token: string,
    prison: (prisonId: string) => Promise<Prison>,
    personIntegrationApiClient: PersonIntegrationApiClient,
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    prisonerDetail: PrisonerDetail,
    secondaryLanguages: SecondaryLanguage[],
    countryOfBirth: string,
    healthAndMedication: HealthAndMedication,
    numberOfChildren: Result<PersonalRelationshipsNumberOfChildrenDto>,
    domesticStatus: Result<PersonalRelationshipsDomesticStatusDto>,
  ): Promise<PersonalDetails> {
    const { profileInformation } = inmateDetail

    const aliases = await this.aliases(personIntegrationApiClient, prisonerData)

    let ethnicGroup = 'Not entered'
    if (prisonerDetail?.ethnicity) {
      ethnicGroup = `${prisonerDetail.ethnicity}`
      if (prisonerDetail?.ethnicityCode) {
        ethnicGroup += ` (${prisonerDetail.ethnicityCode})`
      }
    }

    const nationality =
      getProfileInformationValue(ProfileInformationType.Nationality, profileInformation) || 'Not entered'

    const formatNumberOfChildren = (count: string) => {
      if (count === null || count === undefined) return 'Not entered'
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
      marriageOrCivilPartnership:
        domesticStatus
          .map(status => status?.domesticStatusDescription)
          .getOrHandle(_e => {
            // revert back to using Prisoner Search sourced data:
            return prisonerData.maritalStatus
          }) || 'Not entered',
      nationality,
      numberOfChildren: formatNumberOfChildren(
        numberOfChildren
          .map(dto => dto?.numberOfChildren)
          .getOrHandle(_e => {
            // revert back to using Prison API sourced data:
            return getProfileInformationValue(ProfileInformationType.NumberOfChildren, profileInformation)
          }),
      ),
      otherLanguages: secondaryLanguages.map(({ description, canRead, canSpeak, canWrite, code }) => ({
        language: description,
        code,
        canRead,
        canSpeak,
        canWrite,
      })),
      otherNationalities: getProfileInformationValue(ProfileInformationType.OtherNationalities, profileInformation),
      religionOrBelief: await this.formatReligion(token, inmateDetail.religion),
      sex: prisonerData.gender,
      sexualOrientation:
        getProfileInformationValue(ProfileInformationType.SexualOrientation, profileInformation) || 'Not entered',
      smokerOrVaper:
        this.mapSmokerVaper(getProfileInformationValue(ProfileInformationType.SmokerOrVaper, profileInformation)) ||
        'Not entered',
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

  private async formatReligion(token: string, religion?: string): Promise<string> {
    if (!religion) {
      return 'Not entered'
    }

    const refData = await this.getReferenceDataCodes(token, CorePersonRecordReferenceDataDomain.religion)
    const code = refData.find(r => r.description?.toLowerCase() === religion.toLowerCase() || r.code === religion)
    const override = religionFieldData.referenceDataOverrides.find(o => o.id === code?.code)

    return override ? (override.description ?? religion) : religion
  }

  private aliases = async (personIntegrationApiClient: PersonIntegrationApiClient, prisonerData: Prisoner) => {
    const pseudonyms = await personIntegrationApiClient.getPseudonyms(prisonerData.prisonerNumber)
    return pseudonyms
      .filter(pseudonym => !pseudonym.isWorkingName)
      .map(({ firstName, middleName1, middleName2, lastName, dateOfBirth, sex }) => ({
        alias: formatName(firstName, [middleName1, middleName2].join(' ').trim(), lastName),
        dateOfBirth: formatDate(dateOfBirth, 'short'),
        sex: sex.description,
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

  private mapSmokerVaper = (smokerVaperStatus: string) =>
    ({
      No: 'Does not smoke or vape',
      Yes: 'Smoker',
      'Vaper/NRT Only': 'Vaper or uses nicotine replacement therapy (NRT)',
    })[smokerVaperStatus] ?? smokerVaperStatus

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
      justice: {
        croNumber: getOffenderIdentifierValue(OffenderIdentifierType.CroNumber, identifiers),
        localInmateDataSystemNumber: getOffenderIdentifierValue(
          OffenderIdentifierType.LocalInmateDataSystemNumber,
          identifiers,
        ),
        pncNumber: getOffenderIdentifierValue(OffenderIdentifierType.PncNumber, identifiers),
        prisonNumber: prisonerData.prisonerNumber,
        prisonLegacySystemNumber: getOffenderIdentifierValue(
          OffenderIdentifierType.PrisonLegacySystemNumber,
          identifiers,
        ),
        probationLegacySystemNumber: getOffenderIdentifierValue(
          OffenderIdentifierType.ProbationLegacySystemNumber,
          identifiers,
        ),
        scottishPncNumber: getOffenderIdentifierValue(OffenderIdentifierType.ScottishPncNumber, identifiers),
        yjafNumber: getOffenderIdentifierValue(OffenderIdentifierType.YjafNumber, identifiers),
      },
      personal: {
        drivingLicenceNumber: getOffenderIdentifierValue(OffenderIdentifierType.DrivingLicenseNumber, identifiers),
        nationalInsuranceNumber: getOffenderIdentifierValue(
          OffenderIdentifierType.NationalInsuranceNumber,
          identifiers,
        ),
        passportNumber: getOffenderIdentifierValue(OffenderIdentifierType.PassportNumber, identifiers),
        parkrunNumber: getOffenderIdentifierValue(OffenderIdentifierType.ParkrunNumber, identifiers),
        staffIdentityCardNumber: getOffenderIdentifierValue(
          OffenderIdentifierType.StaffIdentityCardNumber,
          identifiers,
        ),
        uniqueLearnerNumber: getOffenderIdentifierValue(OffenderIdentifierType.UniqueLearnerNumber, identifiers),
      },
      homeOffice: {
        caseInformationDatabase: getOffenderIdentifierValue(
          OffenderIdentifierType.CaseInformationDatabase,
          identifiers,
        ),
        homeOfficeReferenceNumber: getOffenderIdentifierValue(
          OffenderIdentifierType.HomeOfficeReferenceNumber,
          identifiers,
        ),
        portReferenceNumber: getOffenderIdentifierValue(OffenderIdentifierType.PortReferenceNumber, identifiers),
      },
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

  // TODO: Remove once the new NoK/Emergency Contacts tile is released.
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
          address: this.oldAddresses(personAddresses?.addresses),
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

  // TODO: remove once edit profile is rolled out:
  private oldAddresses(addresses: Address[]): OldAddresses | undefined {
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

  async getLearnerNeurodivergence(prisonId: string, prisonerNumber: string): Promise<LearnerNeurodivergence[] | null> {
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

  async getNumberOfChildren(clientToken: string, prisonerNumber: string) {
    const personalRelationshipsApiClient = this.personalRelationshipsApiClientBuilder(clientToken)
    return personalRelationshipsApiClient.getNumberOfChildren(prisonerNumber)
  }

  async updateNumberOfChildren(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    numberOfChildren: number,
  ) {
    const personalRelationshipsApiClient = this.personalRelationshipsApiClientBuilder(clientToken)
    const response = personalRelationshipsApiClient.updateNumberOfChildren(prisonerNumber, {
      numberOfChildren,
      requestedBy: user.username,
    })

    this.metricsService.trackPersonalRelationshipsUpdate({
      fieldsUpdated: ['numberOfChildren'],
      prisonerNumber,
      user,
    })

    return response
  }

  async getMilitaryRecords(clientToken: string, prisonerNumber: string) {
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
    return personIntegrationApiClient.getMilitaryRecords(prisonerNumber)
  }

  async getNextOfKinAndEmergencyContacts(clientToken: string, prisonerNumber: string) {
    return this.nextOfKinService.getNextOfKinEmergencyContacts(clientToken, prisonerNumber)
  }

  async getDomesticStatus(clientToken: string, prisonerNumber: string) {
    return this.domesticStatusService.getDomesticStatus(clientToken, prisonerNumber)
  }

  async updateDomesticStatus(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    domesticStatusCode: string,
  ) {
    return this.domesticStatusService.updateDomesticStatus(clientToken, user, prisonerNumber, {
      domesticStatusCode,
      requestedBy: user.username,
    })
  }

  async getDomesticStatusReferenceData(clientToken: string) {
    return this.domesticStatusService.getReferenceData(clientToken)
  }
}
