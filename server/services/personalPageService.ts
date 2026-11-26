import {
  isGranted,
  PrisonerPermissions,
  PrisonerPropertyPermission,
} from '@ministryofjustice/hmpps-prison-permissions-lib'
import config from '../config'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import PersonalPage, {
  AddressForDisplay,
  GlobalEmail,
  GlobalNumbersAndEmails,
  IdentityNumbers,
  PersonalDetails,
  PhoneNumber,
  PhysicalCharacteristics,
  PropertyItem,
  SummarisedAddresses,
} from './interfaces/personalPageService/PersonalPage'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import {
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
import { CuriousRestClientBuilder, RestClientBuilder } from '../data'
import CuriousApiClient from '../data/interfaces/curiousApi/curiousApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'
import MetricsService from './metrics/metricsService'
import { noCallbackOnErrorBecause, Result } from '../utils/result/result'
import { PersonApiClient } from '../data/interfaces/personApi'
import {
  CorePersonPhysicalAttributesDto,
  CorePersonPhysicalAttributesRequest,
  CorePersonRecordReferenceDataDomain,
  MilitaryRecord,
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
import { ReferenceDataDomain } from '../data/interfaces/referenceData'
import BadRequestError from '../utils/badRequestError'
import { CuriousApiToken } from '../data/hmppsAuthClient'
import { CorePersonPhysicalAttributes } from './interfaces/corePerson/corePersonPhysicalAttributes'
import PrisonService from './prisonService'
import { Prison } from './interfaces/prisonService/PrisonServicePrisons'
import NextOfKinService from './nextOfKinService'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsDomesticStatusDto,
  PersonalRelationshipsNumberOfChildrenDto,
} from '../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import DomesticStatusService from './domesticStatusService'
import { religionFieldData } from '../controllers/personal/fieldData'
import GlobalPhoneNumberAndEmailAddressesService from './globalPhoneNumberAndEmailAddressesService'
import { OffenderIdentifierType } from '../data/interfaces/prisonApi/OffenderIdentifierType'
import AddressService from './addressService'

interface PersonalPageGetOptions {
  personEndpointsEnabled: boolean
  prisonerPropertyServiceEnabled: boolean
  apiErrorCallback: (error: Error) => void
}

export default class PersonalPageService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly curiousApiClientBuilder: CuriousRestClientBuilder<CuriousApiClient>,
    private readonly personApiClientBuilder: RestClientBuilder<PersonApiClient>,
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

  getHealthAndMedication(token: string, prisonerNumber: string): Promise<HealthAndMedication | null> {
    const apiClient = this.healthAndMedicationApiClientBuilder(token)
    return apiClient.getHealthAndMedication(prisonerNumber)
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
    prisonerPermissions: PrisonerPermissions,
    options: Partial<PersonalPageGetOptions> = {},
  ): Promise<PersonalPage> {
    const defaultOptions: PersonalPageGetOptions = {
      personEndpointsEnabled: false,
      prisonerPropertyServiceEnabled: false,
      apiErrorCallback: () => null,
    }
    const getOptions: PersonalPageGetOptions = { ...defaultOptions, ...options }

    const prisonApiClient = this.prisonApiClientBuilder(token)
    const personIntegrationApiClient = this.personIntegrationApiClientBuilder(token)

    const { bookingId, prisonerNumber, prisonId } = prisonerData
    const [
      inmateDetail,
      secondaryLanguages,
      property,
      identifiers,
      learnerNeurodivergence,
      healthAndMedication,
      nextOfKinAndEmergencyContacts,
      personalRelationshipsNumberOfChildren,
      personalRelationshipsDomesticStatus,
    ] = await Promise.all([
      prisonApiClient.getInmateDetail(bookingId),
      prisonApiClient.getSecondaryLanguages(bookingId),
      !getOptions.prisonerPropertyServiceEnabled &&
      isGranted(PrisonerPropertyPermission.read_property_details, prisonerPermissions)
        ? prisonApiClient.getProperty(bookingId)
        : null,
      prisonApiClient.getIdentifiers(prisonerNumber, true),
      Result.wrap(this.getLearnerNeurodivergence(prisonId, prisonerNumber), getOptions.apiErrorCallback),
      Result.wrap(this.getHealthAndMedication(token, prisonerNumber), getOptions.apiErrorCallback),
      Result.wrap(this.getNextOfKinAndEmergencyContacts(token, prisonerNumber), getOptions.apiErrorCallback),
      Result.wrap(
        this.getNumberOfChildren(token, prisonerNumber),
        noCallbackOnErrorBecause('we are falling back to prisoner search data'),
      ),
      Result.wrap(
        this.getDomesticStatus(token, prisonerNumber),
        noCallbackOnErrorBecause('we are falling back to prison api data'),
      ),
    ])

    let addresses: Result<AddressForDisplay[], Error>
    let distinguishingMarks: Result<PersonIntegrationDistinguishingMark[], Error>
    let militaryRecords: Result<MilitaryRecord[], Error>
    let globalNumbersAndEmails: Result<GlobalNumbersAndEmails, Error>
    let physicalAttributes: Result<CorePersonPhysicalAttributes, Error>
    if (getOptions.personEndpointsEnabled) {
      const profileSummary = await Result.wrap(
        personIntegrationApiClient.getPrisonerProfileSummary(prisonerData.prisonerNumber),
        getOptions.apiErrorCallback,
      )
      ;[addresses, globalNumbersAndEmails, distinguishingMarks, militaryRecords, physicalAttributes] =
        await Promise.all([
          Result.wrap(this.addressService.getAddressesForDisplay(token, prisonerNumber), getOptions.apiErrorCallback),
          profileSummary.mapAsync(summary =>
            this.globalPhoneNumberAndEmailAddressesService.transformContacts(token, summary.contacts),
          ),
          profileSummary.map(summary => summary.distinguishingMarks),
          profileSummary.map(summary => summary.militaryRecords),
          profileSummary.map(summary => this.transformPhysicalAttributes(summary.physicalAttributes)),
        ])
    } else {
      ;[addresses, distinguishingMarks, militaryRecords, physicalAttributes, globalNumbersAndEmails] =
        await Promise.all([
          Result.wrap(this.addressService.getAddressesForDisplay(token, prisonerNumber), getOptions.apiErrorCallback),
          Result.wrap(this.getDistinguishingMarks(token, prisonerNumber), getOptions.apiErrorCallback),
          Result.wrap(this.getMilitaryRecords(token, prisonerNumber), getOptions.apiErrorCallback),
          Result.wrap(this.getPhysicalAttributes(token, prisonerNumber), getOptions.apiErrorCallback),
          Result.wrap(this.getGlobalPhonesAndEmails(token, prisonerNumber), getOptions.apiErrorCallback),
        ])
    }

    const addressResponseResult: Result<SummarisedAddresses, Error> = addresses.map(addressesForDisplay => {
      return {
        primaryOrPostal: addressesForDisplay?.filter(address => address.primaryAddress || address.postalAddress),
        totalActive:
          addressesForDisplay?.filter(address => !address.toDate || new Date(address.toDate) > new Date())?.length || 0,
      }
    })

    let countryOfBirth: Result<string, Error> = Result.fulfilled(null)
    if (inmateDetail.birthCountryCode) {
      const refData = await Result.wrap(
        this.getReferenceData(token, CorePersonRecordReferenceDataDomain.country, inmateDetail.birthCountryCode),
        getOptions.apiErrorCallback,
      )
      countryOfBirth = refData.map(data => data.description)
    }

    const [personalDetails] = await Promise.all([
      this.personalDetails(
        token,
        id => this.prisonService.getPrisonByPrisonId(id, token),
        personIntegrationApiClient,
        prisonerData,
        inmateDetail,
        secondaryLanguages,
        countryOfBirth,
        healthAndMedication,
        personalRelationshipsNumberOfChildren,
        personalRelationshipsDomesticStatus,
      ),
    ])
    return {
      personalDetails,
      identityNumbers: this.identityNumbers(prisonerData, identifiers),
      property: this.property(property),
      addresses: addressResponseResult,
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
      distinguishingMarks,
      militaryRecords: militaryRecords.map(records => records?.filter(record => record.militarySeq === 1)), // Temporary fix to only show the first military record - designs for multiple not ready yet
      globalNumbersAndEmails,
    }
  }

  private async personalDetails(
    token: string,
    prison: (prisonId: string) => Promise<Prison>,
    personIntegrationApiClient: PersonIntegrationApiClient,
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    secondaryLanguages: SecondaryLanguage[],
    countryOfBirth: Result<string>,
    healthAndMedication: Result<HealthAndMedication>,
    numberOfChildren: Result<PersonalRelationshipsNumberOfChildrenDto>,
    domesticStatus: Result<PersonalRelationshipsDomesticStatusDto>,
  ): Promise<PersonalDetails> {
    const { profileInformation, physicalAttributes } = inmateDetail
    const { ethnicity, raceCode: ethnicityCode } = physicalAttributes

    const [aliases, religionOrBelief] = await Promise.all([
      this.aliases(personIntegrationApiClient, prisonerData),
      this.getReligionOrBelief(token, inmateDetail),
    ])

    let ethnicGroup = 'Not entered'
    if (ethnicity) {
      ethnicGroup = `${ethnicity}`
      if (ethnicityCode) {
        ethnicGroup += ` (${ethnicityCode})`
      }
    }

    const nationality =
      getProfileInformationValue(ProfileInformationType.Nationality, profileInformation) || 'Not entered'

    const formatNumberOfChildren = (count: string) => {
      if (count === null || count === undefined) return 'Not entered'
      if (count === '0') return 'None'
      return count
    }

    const foodAllergyAndDietLatestUpdate = healthAndMedication.map(this.latestModificationDetails).getOrNull()
    const lastUpdatedAgency = foodAllergyAndDietLatestUpdate?.lastModifiedPrisonId
      ? await prison(foodAllergyAndDietLatestUpdate.lastModifiedPrisonId)
      : null

    return {
      age: calculateAge(inmateDetail.dateOfBirth),
      aliases,
      dateOfBirth: formatDate(inmateDetail.dateOfBirth, 'short'),
      domesticAbusePerpetrator: getProfileInformationValue(
        ProfileInformationType.DomesticAbusePerpetrator,
        profileInformation,
      ),
      domesticAbuseVictim: getProfileInformationValue(ProfileInformationType.DomesticAbuseVictim, profileInformation),
      cityOrTownOfBirth: inmateDetail.birthPlace ? convertToTitleCase(inmateDetail.birthPlace) : 'Not entered',
      countryOfBirth: countryOfBirth.map(country => (country ? convertToTitleCase(country) : 'Not entered')),
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
      religionOrBelief: religionOrBelief?.description || 'Not entered',
      sex: prisonerData.gender,
      sexualOrientation:
        getProfileInformationValue(ProfileInformationType.SexualOrientation, profileInformation) || 'Not entered',
      smokerOrVaper:
        this.mapSmokerVaper(getProfileInformationValue(ProfileInformationType.SmokerOrVaper, profileInformation)) ||
        'Not entered',
      socialCareNeeded: getProfileInformationValue(ProfileInformationType.SocialCareNeeded, profileInformation),
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

  async getReligionOrBelief(
    clientToken: string,
    inmateDetail: InmateDetail,
  ): Promise<{ code: string; description: string } | null> {
    if (!config.featureToggles.usePersonApi.religion) {
      const religion = getProfileInformationValue(ProfileInformationType.Religion, inmateDetail.profileInformation)
      if (!religion) {
        return null
      }

      const refData = await this.getReferenceDataCodes(clientToken, CorePersonRecordReferenceDataDomain.religion)
      const code = refData.find(r => r.description?.toLowerCase() === religion.toLowerCase() || r.code === religion)
      const override = religionFieldData.referenceDataOverrides.find(o => o.id === code?.code)

      return {
        code: '?',
        ...code,
        description: override?.description ?? religion,
      }
    }

    const personApiClient = this.personApiClientBuilder(clientToken)
    // TODO: extract out into a shared variable when more domains are retrieved from this endpoint
    const record = await personApiClient.getRecord(inmateDetail.offenderNo)
    if (!record.religion?.code) {
      return null
    }

    const override = religionFieldData.referenceDataOverrides.find(o => o.id === record.religion.code)
    return {
      code: record.religion.code,
      description: override?.description ?? record.religion.description,
    }
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
      return null
    }
    return property.map(({ location, containerType, sealMark }) => ({
      containerType,
      sealMark: sealMark || 'Not entered',
      location: location?.userDescription || 'Not entered',
    }))
  }

  private async addressForPerson(
    personId: number,
    prisonApiClient: PrisonApiClient,
  ): Promise<{ personId: number; addresses: Address[] }> {
    const addresses = await prisonApiClient.getAddressesForPerson(personId)
    return { personId, addresses }
  }

  private physicalCharacteristics(
    inmateDetail: InmateDetail,
    physicalAttributesResult: Result<CorePersonPhysicalAttributes>,
  ): Result<PhysicalCharacteristics> {
    return physicalAttributesResult.map(physicalAttributes => {
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
    })
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
    if (!config.featureToggles.usePersonApi.religion) {
      const personIntegrationApiClient = this.personIntegrationApiClientBuilder(clientToken)
      await personIntegrationApiClient.updateReligion(prisonerNumber, religionCode, reasonForChange)
    } else {
      const personApiClient = this.personApiClientBuilder(clientToken)
      await personApiClient.updateReligion(prisonerNumber, {
        userId: user.username,
        religionCode,
        comment: reasonForChange,
      })
    }

    this.metricsService.trackPersonIntegrationUpdate({
      fieldsUpdated: ['religion'],
      prisonerNumber,
      user,
    })
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
