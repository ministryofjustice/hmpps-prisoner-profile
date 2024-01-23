import { isSameYear, startOfYear } from 'date-fns'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import {
  Addresses,
  CareNeeds,
  IdentityNumbers,
  NextOfKin,
  PersonalDetails,
  PersonalPage,
  PhysicalCharacteristics,
  PropertyItem,
  ReasonableAdjustment as PersonalPageReasonableAdjustment,
} from '../interfaces/pages/personalPage'
import { Prisoner } from '../interfaces/prisoner'
import { addressToLines, formatName, calculateAge } from '../utils/utils'
import { getProfileInformationValue, ProfileInformationType } from '../interfaces/prisonApi/profileInformation'
import {
  getOffenderIdentifierValue,
  OffenderIdentifier,
  OffenderIdentifierType,
} from '../interfaces/prisonApi/offenderIdentifier'
import { Address } from '../interfaces/prisonApi/address'
import { OffenderContacts } from '../interfaces/prisonApi/offenderContacts'
import { InmateDetail } from '../interfaces/prisonApi/inmateDetail'
import { SecondaryLanguage } from '../interfaces/prisonApi/secondaryLanguage'
import { PrisonerDetail } from '../interfaces/prisonerDetail'
import { PropertyContainer } from '../interfaces/prisonApi/propertyContainer'
import { ReferenceCode, ReferenceCodeDomain } from '../interfaces/prisonApi/referenceCode'
import { formatDate } from '../utils/dateHelpers'
import { getMostRecentAddress } from '../utils/getMostRecentAddress'
import { GovSummaryItem } from '../interfaces/govSummaryItem'
import { HealthDomainReferenceCode, PersonalCareNeed } from '../interfaces/personalCareNeeds'
import { ReasonableAdjustment } from '../interfaces/prisonApi/reasonableAdjustment'
import { RestClientBuilder } from '../data'
import { CuriousApiClient } from '../data/interfaces/curiousApiClient'
import { LearnerNeurodivergence } from '../interfaces/learnerNeurodivergence'

export default class PersonalPageService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly curiousApiClientBuilder: RestClientBuilder<CuriousApiClient>,
  ) {}

  public async get(token: string, prisonerData: Prisoner): Promise<PersonalPage> {
    const prisonApiClient = this.prisonApiClientBuilder(token)
    const curiousApiClient = this.curiousApiClientBuilder(token)

    const { bookingId, prisonerNumber } = prisonerData
    const [
      inmateDetail,
      prisonerDetail,
      secondaryLanguages,
      property,
      addressList,
      contacts,
      healthReferenceCodes,
      healthTreatmentReferenceCodes,
      identifiers,
    ] = await Promise.all([
      prisonApiClient.getInmateDetail(bookingId),
      prisonApiClient.getPrisoner(prisonerNumber),
      prisonApiClient.getSecondaryLanguages(bookingId),
      prisonApiClient.getProperty(bookingId),
      prisonApiClient.getAddresses(prisonerNumber),
      prisonApiClient.getOffenderContacts(prisonerNumber),
      prisonApiClient.getReferenceCodesByDomain(ReferenceCodeDomain.Health),
      prisonApiClient.getReferenceCodesByDomain(ReferenceCodeDomain.HealthTreatments),
      prisonApiClient.getIdentifiers(bookingId),
    ])

    const addresses: Addresses = this.addresses(addressList)
    const healthCodes = healthReferenceCodes.map(code => code.code)
    const treatmentCodes = healthTreatmentReferenceCodes.map(code => code.code)
    const [{ personalCareNeeds }, { reasonableAdjustments }] = await Promise.all([
      prisonApiClient.getPersonalCareNeeds(inmateDetail.bookingId, healthCodes),
      prisonApiClient.getReasonableAdjustments(inmateDetail.bookingId, treatmentCodes),
    ])

    return {
      personalDetails: this.personalDetails(prisonerData, inmateDetail, prisonerDetail, secondaryLanguages),
      identityNumbers: this.identityNumbers(prisonerData, identifiers),
      property: this.property(property),
      addresses,
      addressSummary: this.addressSummary(addresses),
      nextOfKin: await this.nextOfKin(contacts, prisonApiClient),
      physicalCharacteristics: this.physicalCharacteristics(prisonerData, inmateDetail),
      security: {
        interestToImmigration: getProfileInformationValue(
          ProfileInformationType.InterestToImmigration,
          inmateDetail.profileInformation,
        ),
        travelRestrictions: getProfileInformationValue(
          ProfileInformationType.TravelRestrictions,
          inmateDetail.profileInformation,
        ),
        xrays: this.xrays(personalCareNeeds),
      },
      careNeeds: await this.careNeeds(healthReferenceCodes, personalCareNeeds, reasonableAdjustments),
      learnerNeurodivergence: await this.getLearnerNeurodivergence(prisonerNumber, curiousApiClient),
    }
  }

  private addressSummary(addresses: Addresses): GovSummaryItem[] {
    const addressSummary: GovSummaryItem[] = []

    if (addresses) {
      addressSummary.push({
        key: { text: 'Address' },
        value: { html: addressToLines(addresses.address).join('<br/>') },
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
      smokerOrVaper:
        getProfileInformationValue(ProfileInformationType.SmokerOrVaper, profileInformation) || 'Not entered',
      socialCareNeeded: getProfileInformationValue(ProfileInformationType.SocialCareNeeded, profileInformation),
      typeOfDiet: getProfileInformationValue(ProfileInformationType.TypesOfDiet, profileInformation) || 'Not entered',
      youthOffender: prisonerData.youthOffender ? 'Yes' : 'No',
    }
  }

  private identityNumbers(prisonerData: Prisoner, identifiers: OffenderIdentifier[]): IdentityNumbers {
    return {
      croNumber: prisonerData.croNumber || 'Not entered',
      drivingLicenceNumber: getOffenderIdentifierValue(OffenderIdentifierType.DrivingLicenseNumber, identifiers),
      homeOfficeReferenceNumber: getOffenderIdentifierValue(
        OffenderIdentifierType.HomeOfficeReferenceNumber,
        identifiers,
      ),
      nationalInsuranceNumber: getOffenderIdentifierValue(OffenderIdentifierType.NationalInsuranceNumber, identifiers),
      pncNumber: prisonerData.pncNumber || 'Not entered',
      prisonNumber: prisonerData.prisonerNumber,
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

  private physicalCharacteristics(prisonerData: Prisoner, inmateDetail: InmateDetail): PhysicalCharacteristics {
    return {
      build: prisonerData.build || 'Not entered',
      distinguishingMarks:
        inmateDetail.physicalMarks?.map(({ bodyPart, comment, imageId, side, orentiation, type }) => ({
          bodyPart,
          comment,
          imageId,
          side,
          orientation: orentiation,
          type,
        })) || [],
      facialHair: prisonerData.facialHair || 'Not entered',
      hairColour: prisonerData.hairColour || 'Not entered',
      height: prisonerData.heightCentimetres ? `${(prisonerData.heightCentimetres / 100).toString()}m` : 'Not entered',
      leftEyeColour: prisonerData.leftEyeColour || 'Not entered',
      rightEyeColour: prisonerData.rightEyeColour || 'Not entered',
      shapeOfFace: prisonerData.shapeOfFace || 'Not entered',
      shoeSize: prisonerData.shoeSize ? prisonerData.shoeSize.toString() : 'Not entered',
      warnedAboutTattooing:
        getProfileInformationValue(ProfileInformationType.WarnedAboutTattooing, inmateDetail.profileInformation) ||
        'Needs to be warned',
      warnedNotToChangeAppearance:
        getProfileInformationValue(
          ProfileInformationType.WarnedNotToChangeAppearance,
          inmateDetail.profileInformation,
        ) || 'Needs to be warned',
      weight: prisonerData.weightKilograms ? `${prisonerData.weightKilograms}kg` : 'Not entered',
    }
  }

  private async careNeeds(
    healthReferenceCodes: ReferenceCode[],
    personalCareNeeds: PersonalCareNeed[],
    reasonableAdjustments: ReasonableAdjustment[],
  ): Promise<CareNeeds> {
    const careNeedType = (problemType: string) => {
      return healthReferenceCodes.find(code => code.code === problemType)?.description || problemType
    }

    function mapReasonableAdjustmentToCareNeed(careNeedId?: number): PersonalPageReasonableAdjustment[] {
      if (careNeedId) {
        return reasonableAdjustments
          .filter(adjustment => adjustment.personalCareNeedId === careNeedId)
          .map(adjustment => ({
            type: 'Support needed',
            description: adjustment.treatmentDescription,
            startDate: adjustment.startDate,
            comment: adjustment.commentText,
            agency: adjustment.agencyDescription,
          }))
      }
      return []
    }

    const healthCodes = healthReferenceCodes.map(code => code.code)
    const excludedProblemCodes = ['NR']
    const excludedProblemTypes = [HealthDomainReferenceCode.XRayBodyScan.toString()]

    return {
      personalCareNeeds: personalCareNeeds
        ?.filter(
          careNeed =>
            careNeed.problemStatus === 'ON' &&
            healthCodes.includes(careNeed.problemType) &&
            !excludedProblemCodes.includes(careNeed.problemCode) &&
            !excludedProblemTypes.includes(careNeed.problemType),
        )
        .map(careNeed => ({
          comment: careNeed.commentText,
          startDate: careNeed.startDate,
          type: careNeedType(careNeed.problemType),
          description: careNeed.problemDescription,
          reasonableAdjustments: mapReasonableAdjustmentToCareNeed(careNeed.personalCareNeedId),
        })),
    }
  }

  private xrays(personalCareNeeds: PersonalCareNeed[]): { total: number; since?: string } {
    const yearStart = startOfYear(new Date())
    const xrayNeeds = personalCareNeeds
      .filter(need => need.problemType === HealthDomainReferenceCode.XRayBodyScan)
      .filter(need => isSameYear(new Date(need.startDate), yearStart))
    return {
      total: xrayNeeds.length,
      since: xrayNeeds.length > 0 ? yearStart.toISOString() : undefined,
    }
  }

  private async getLearnerNeurodivergence(prisonerNumber: string, curiousApiClient: CuriousApiClient) {
    const learnerNeurodivergence: LearnerNeurodivergence[] =
      await curiousApiClient.getLearnerNeurodivergence(prisonerNumber)
    return learnerNeurodivergence
  }
}
