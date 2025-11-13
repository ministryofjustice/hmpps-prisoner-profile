import { ApolloClient, gql } from '@apollo/client'
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
import { ReferenceDataValue } from '../data/interfaces/ReferenceDataValue'

interface PersonalPageGetOptions {
  dietAndAllergyIsEnabled: boolean
  editProfileEnabled: boolean
  simulateFetchEnabled: boolean
  personalRelationshipsApiReadEnabled: boolean
  healthAndMedicationApiReadEnabled: boolean
  personEndpointsEnabled: boolean
  apiErrorCallback: (error: Error) => void
}

interface ProfileGql {
  offenderByPrisonerNumber: {
    personalDetails: {
      dateOfBirth: string
      cityOrTownOfBirth?: string
      nationality?: string
      additionalNationalities?: string
      sex?: string
      sexualOrientation?: string
      marriageOrCivilPartnershipStatus?: string
      numberOfChildren?: string
      typeOfDiet?: string
      smokerOrVaper?: string
      socialCareNeeded?: string
      name: { firstName: string; middleNames?: string; lastName: string }
      languages: {
        interpreterRequired: boolean
        written: string
        spoken: string
        secondary: {
          code: string
          description: string
          canRead: boolean
          canWrite: boolean
          canSpeak: boolean
        }[]
      }
      ethnicity: {
        code: string
        description: string
      }
      pseudonyms: {
        personId: string
        sourceSystemId: number
        sourceSystem: string
        prisonerNumber: string
        firstName: string
        middleName1?: string
        middleName2?: string
        lastName: string
        dateOfBirth: string
        sex: ReferenceDataValue
        nameType: ReferenceDataValue
        title: ReferenceDataValue
        ethnicity: ReferenceDataValue
        isWorkingName: boolean
      }[]
    }
  }
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
    private readonly profileGqlClientBuilder: (token: string) => ApolloClient,
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

  async createGlobalEmail(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    value: string,
  ): Promise<GlobalEmail> {
    return this.globalPhoneNumberAndEmailAddressesService.createEmailForPrisonerNumber(
      token,
      user,
      prisonerNumber,
      value,
    )
  }

  async updateGlobalEmail(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    emailAddressId: string,
    value: string,
  ): Promise<GlobalEmail> {
    return this.globalPhoneNumberAndEmailAddressesService.updateEmailForPrisonerNumber(
      token,
      user,
      prisonerNumber,
      emailAddressId,
      value,
    )
  }

  async createGlobalPhoneNumber(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    values: { phoneNumber: string; phoneNumberType: string; phoneExtension: string },
  ): Promise<PhoneNumber> {
    return this.globalPhoneNumberAndEmailAddressesService.createPhoneNumberForPrisonerNumber(
      token,
      user,
      prisonerNumber,
      values,
    )
  }

  async updateGlobalPhoneNumber(
    token: string,
    user: PrisonUser,
    prisonerNumber: string,
    phoneNumberId: string,
    values: { phoneNumber: string; phoneNumberType: string; phoneExtension: string },
  ): Promise<PhoneNumber> {
    return this.globalPhoneNumberAndEmailAddressesService.updatePhoneNumberForPrisonerNumber(
      token,
      user,
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

  private transformPhysicalAttributes(
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
    return this.transformPhysicalAttributes(physicalAttributesDto)
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
      simulateFetchEnabled: false,
      personalRelationshipsApiReadEnabled: true,
      healthAndMedicationApiReadEnabled: false,
      personEndpointsEnabled: false,
      apiErrorCallback: () => null,
    }
    const getOptions: PersonalPageGetOptions = { ...defaultOptions, ...options }

    const prisonApiClient = this.prisonApiClientBuilder(token)
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(token)
    const profileGqlClient = this.profileGqlClientBuilder(token)

    const { bookingId, prisonerNumber, prisonId } = prisonerData
    const [
      profileGql,
      inmateDetail,
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
      profileGqlClient.query<ProfileGql, { prisonerNumber: string }>({
        query: gql`
          query ($prisonerNumber: String!) {
            offenderByPrisonerNumber(id: $prisonerNumber) {
              personalDetails {
                additionalNationalities
                cityOrTownOfBirth
                dateOfBirth
                marriageOrCivilPartnershipStatus
                nationality
                numberOfChildren
                sex
                sexualOrientation
                smokerOrVaper
                socialCareNeeded
                typeOfDiet
                name {
                  firstName
                  middleNames
                  lastName
                }
                pseudonyms(includeWorkingName: false) {
                  firstName
                  lastName
                  sex {
                    description
                  }
                }
                ethnicity {
                  code
                  description
                }
                languages {
                  written
                  spoken
                  interpreterRequired
                  secondary {
                    code
                    description
                    canRead
                    canSpeak
                    canWrite
                  }
                }
              }
              contacts {
                emails {
                  id
                  value
                }
                phones {
                  id
                  type
                  value
                  extension
                }
              }
            }
          }
        `,
        variables: { prisonerNumber },
      }),
      prisonApiClient.getInmateDetail(bookingId),
      prisonApiClient.getSecondaryLanguages(bookingId),
      prisonApiClient.getProperty(bookingId),
      !getOptions.editProfileEnabled ? prisonApiClient.getAddresses(prisonerNumber) : null,
      prisonApiClient.getOffenderContacts(prisonerNumber),
      prisonApiClient.getIdentifiers(prisonerNumber, getOptions.editProfileEnabled),
      prisonApiClient.getBeliefHistory(prisonerNumber),
      Result.wrap(this.getLearnerNeurodivergence(prisonId, prisonerNumber), getOptions.apiErrorCallback),
      Result.wrap(
        this.getHealthAndMedication(token, prisonerNumber, {
          dietAndAllergiesEnabled: getOptions.dietAndAllergyIsEnabled,
          healthAndMedicationApiReadEnabled: getOptions.healthAndMedicationApiReadEnabled,
        }),
        getOptions.apiErrorCallback,
      ),
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

    // When enabled, call the services required for edit profile without blocking for load testing purposes
    // Does not use the person endpoints (which are not active in prod 10/10/25) - this should result in a worst case test
    if (options.simulateFetchEnabled) {
      Promise.all([
        prisonApiClient.getIdentifiers(prisonerNumber, true),
        this.addressService.getAddressesForDisplay(token, prisonerNumber),
        this.getDistinguishingMarks(token, prisonerNumber),
        this.getGlobalPhonesAndEmails(token, prisonerNumber),
      ])
    }

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
      physicalAttributes = this.transformPhysicalAttributes(profileSummary.physicalAttributes)
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
        countryOfBirth,
        healthAndMedication,
        personalRelationshipsNumberOfChildren,
        personalRelationshipsDomesticStatus,
        profileGql.data,
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
    countryOfBirth: string,
    healthAndMedication: Result<HealthAndMedication>,
    numberOfChildren: Result<PersonalRelationshipsNumberOfChildrenDto>,
    domesticStatus: Result<PersonalRelationshipsDomesticStatusDto>,
    profileGql: ProfileGql,
  ): Promise<PersonalDetails> {
    const { profileInformation } = inmateDetail

    const formatNumberOfChildren = (count: string) => {
      if (count === null || count === undefined) return 'Not entered'
      if (count === '0') return 'None'
      return count
    }

    const foodAllergyAndDietLatestUpdate = healthAndMedication.map(this.latestModificationDetails).getOrNull()
    const lastUpdatedAgency = foodAllergyAndDietLatestUpdate?.lastModifiedPrisonId
      ? await prison(foodAllergyAndDietLatestUpdate.lastModifiedPrisonId)
      : null

    const { personalDetails } = profileGql.offenderByPrisonerNumber

    let ethnicGroup = 'Not entered'
    if (personalDetails.ethnicity.description) {
      ethnicGroup = `${personalDetails.ethnicity.description}`
      if (personalDetails.ethnicity.code) {
        ethnicGroup += ` (${personalDetails.ethnicity.code})`
      }
    }

    return {
      // START - GQL Spike data

      age: calculateAge(personalDetails.dateOfBirth),
      dateOfBirth: formatDate(personalDetails.dateOfBirth, 'short'),
      cityOrTownOfBirth: personalDetails.cityOrTownOfBirth
        ? convertToTitleCase(personalDetails.cityOrTownOfBirth)
        : 'Not entered',
      marriageOrCivilPartnership:
        // This could be handled in the API
        domesticStatus
          .map(status => status?.domesticStatusDescription)
          .getOrHandle(_e => {
            return personalDetails.marriageOrCivilPartnershipStatus
          }) || 'Not entered',
      fullName: formatName(
        personalDetails.name.firstName,
        personalDetails.name.middleNames,
        personalDetails.name.lastName,
      ),
      nationality: personalDetails.nationality,
      numberOfChildren: formatNumberOfChildren(
        numberOfChildren
          .map(dto => dto?.numberOfChildren)
          .getOrHandle(_e => {
            return personalDetails.numberOfChildren
          }),
      ),
      sex: personalDetails.sex,
      sexualOrientation: personalDetails.sexualOrientation,
      languages: {
        interpreterRequired: personalDetails.languages.interpreterRequired,
        spoken: personalDetails.languages.spoken,
        written: personalDetails.languages.written,
      },
      otherLanguages: personalDetails.languages.secondary.map(({ description, canRead, canSpeak, canWrite, code }) => ({
        language: description,
        code,
        canRead,
        canSpeak,
        canWrite,
      })),
      aliases: this.aliases(profileGql),
      otherNationalities: personalDetails.additionalNationalities,
      typeOfDiet: personalDetails.typeOfDiet,
      smokerOrVaper: this.mapSmokerVaper(personalDetails.smokerOrVaper) || 'Not entered',
      socialCareNeeded: personalDetails.socialCareNeeded,
      // END - GQL Spike data

      domesticAbusePerpetrator: getProfileInformationValue(
        ProfileInformationType.DomesticAbusePerpetrator,
        profileInformation,
      ),
      domesticAbuseVictim: getProfileInformationValue(ProfileInformationType.DomesticAbuseVictim, profileInformation),
      countryOfBirth: countryOfBirth ? convertToTitleCase(countryOfBirth) : 'Not entered',
      ethnicGroup,
      religionOrBelief: await this.formatReligion(token, inmateDetail.religion),
      youthOffender: prisonerData.youthOffender ? 'Yes' : 'No',
      dietAndAllergy: healthAndMedication.map(result => ({
        foodAllergies: this.mapDietAndAllergy(result, 'foodAllergies'),
        medicalDietaryRequirements: this.mapDietAndAllergy(result, 'medicalDietaryRequirements'),
        personalisedDietaryRequirements: this.mapDietAndAllergy(result, 'personalisedDietaryRequirements'),
        cateringInstructions: result?.dietAndAllergy?.cateringInstructions?.value ?? '',
        lastModifiedAt: formatDate(foodAllergyAndDietLatestUpdate?.lastModifiedAt),
        lastModifiedPrison: lastUpdatedAgency?.prisonName ?? '',
      })),
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

  private aliases = (profileGql: ProfileGql) => {
    return profileGql.offenderByPrisonerNumber.personalDetails.pseudonyms
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
