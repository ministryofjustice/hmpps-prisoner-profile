import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import {
  Addresses,
  IdentityNumbers,
  NextOfKin,
  PersonalDetails,
  PersonalPage,
  PhysicalCharacteristics,
  PropertyItem,
} from '../interfaces/pages/personalPage'
import { Prisoner } from '../interfaces/prisoner'
import { formatName, yearsBetweenDateStrings } from '../utils/utils'
import { getProfileInformationValue, ProfileInformationType } from '../interfaces/prisonApi/profileInformation'
import { getOffenderIdentifierValue, OffenderIdentifierType } from '../interfaces/prisonApi/offenderIdentifier'
import { Address } from '../interfaces/prisonApi/address'
import { OffenderContacts } from '../interfaces/prisonApi/offenderContacts'
import { InmateDetail } from '../interfaces/prisonApi/inmateDetail'
import { SecondaryLanguage } from '../interfaces/prisonApi/secondaryLanguage'
import { PrisonerDetail } from '../interfaces/prisonerDetail'
import { PropertyContainer } from '../interfaces/prisonApi/propertyContainer'

export default class PersonalPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner): Promise<PersonalPage> {
    const { bookingId, prisonerNumber } = prisonerData

    const [inmateDetail, prisonerDetail, secondaryLanguages, property, addresses, contacts] = await Promise.all([
      this.prisonApiClient.getInmateDetail(bookingId),
      this.prisonApiClient.getPrisoner(prisonerNumber),
      this.prisonApiClient.getSecondaryLanguages(bookingId),
      this.prisonApiClient.getProperty(bookingId),
      this.prisonApiClient.getAddresses(prisonerNumber),
      this.prisonApiClient.getOffenderContacts(prisonerNumber),
    ])

    return {
      personalDetails: this.personalDetails(prisonerData, inmateDetail, prisonerDetail, secondaryLanguages),
      identityNumbers: this.identityNumbers(prisonerData, inmateDetail),
      property: this.property(property),
      addresses: this.addresses(addresses),
      nextOfKin: await this.nextOfKin(contacts),
      physicalCharacteristics: this.physicalCharacteristics(prisonerData, inmateDetail),
    }
  }

  private personalDetails(
    prisonerData: Prisoner,
    inmateDetail: InmateDetail,
    prisonerDetail: PrisonerDetail,
    secondaryLanguages: SecondaryLanguage[],
  ): PersonalDetails {
    const { profileInformation } = inmateDetail

    const aliases = prisonerData.aliases.map(({ firstName, middleNames, lastName, dateOfBirth }) => ({
      alias: formatName(firstName, middleNames, lastName),
      dateOfBirth,
    }))

    const todaysDateString = new Date().toISOString()

    return {
      age: (inmateDetail.age || yearsBetweenDateStrings(prisonerData.dateOfBirth, todaysDateString)).toString(),
      aliases,
      dateOfBirth: prisonerData.dateOfBirth,
      domesticAbusePerpetrator: getProfileInformationValue(
        ProfileInformationType.DomesticAbusePerpetrator,
        profileInformation,
      ),
      domesticAbuseVictim: getProfileInformationValue(ProfileInformationType.DomesticAbuseVictim, profileInformation),
      ethnicGroup: prisonerData.ethnicity || 'Not entered',
      fullName: formatName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
      languages: {
        interpreterRequired: inmateDetail.interpreterRequired,
        spoken: inmateDetail.language,
        written: inmateDetail.writtenLanguage,
      },
      marriageOrCivilPartnership: prisonerData.maritalStatus || 'Not entered',
      nationality: prisonerData.nationality,
      numberOfChildren:
        getProfileInformationValue(ProfileInformationType.NumberOfChildren, profileInformation) || 'Not entered',
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
        prisonerDetail.currentWorkingFirstName,
        undefined,
        prisonerDetail.currentWorkingLastName,
      ),
      religionOrBelief: prisonerData.religion || 'Not entered',
      sex: prisonerData.gender,
      sexualOrientation:
        getProfileInformationValue(ProfileInformationType.SexualOrientation, profileInformation) || 'Not entered',
      smokerOrVaper:
        getProfileInformationValue(ProfileInformationType.SmokerOrVaper, profileInformation) || 'Not entered',
      socialCareNeeded: getProfileInformationValue(ProfileInformationType.SocialCareNeeded, profileInformation),
      typeOfDiet: getProfileInformationValue(ProfileInformationType.TypesOfDiet, profileInformation) || 'Not entered',
    }
  }

  private identityNumbers(prisonerData: Prisoner, inmateDetail: InmateDetail): IdentityNumbers {
    return {
      croNumber: prisonerData.croNumber || 'Not entered',
      drivingLicenceNumber: getOffenderIdentifierValue(
        OffenderIdentifierType.DrivingLicenseNumber,
        inmateDetail.identifiers,
      ),
      homeOfficeReferenceNumber: getOffenderIdentifierValue(
        OffenderIdentifierType.HomeOfficeReferenceNumber,
        inmateDetail.identifiers,
      ),
      nationalInsuranceNumber: getOffenderIdentifierValue(
        OffenderIdentifierType.NationalInsuranceNumber,
        inmateDetail.identifiers,
      ),
      pncNumber: prisonerData.pncNumber || 'Not entered',
      prisonNumber: prisonerData.prisonerNumber,
    }
  }

  private property(property: PropertyContainer[]): PropertyItem[] {
    return property.map(({ location, containerType, sealMark }) => ({
      containerType,
      sealMark: sealMark || 'Not entered',
      location: location?.userDescription || 'Not entered',
    }))
  }

  private addresses(addresses: Address[]): Addresses {
    const primaryAddress = addresses.find(address => address.primary)
    return {
      comment: primaryAddress?.comment || '',
      phones: primaryAddress?.phones.map(phone => phone.number) || [],
      addressTypes:
        primaryAddress?.addressUsages
          .filter(usage => usage.activeFlag && usage.activeFlag)
          .map(usage => usage.addressUsageDescription) || [],
      address: {
        country: primaryAddress?.country || '',
        county: primaryAddress?.county || '',
        flat: primaryAddress?.flat || '',
        locality: primaryAddress?.locality || '',
        postalCode: primaryAddress?.postalCode || '',
        premise: primaryAddress?.premise || '',
        street: primaryAddress?.street || '',
        town: primaryAddress?.town || '',
      },
      addedOn: primaryAddress?.startDate || '',
    }
  }

  private async nextOfKin(contacts: OffenderContacts): Promise<NextOfKin[]> {
    const activeNextOfKinContacts = contacts.offenderContacts.filter(contact => contact.active && contact.nextOfKin)
    const contactAddresses = await Promise.all(
      activeNextOfKinContacts.map(contact => this.addressForPerson(contact.personId)),
    )

    return contacts.offenderContacts
      .filter(contact => contact.nextOfKin && contact.active)
      .map(contact => {
        const personAddresses = contactAddresses.find(address => address.personId === contact.personId)

        return {
          address: this.addresses(personAddresses.addresses),
          emails: contact.emails?.map(({ email }) => email) || [],
          emergencyContact: contact.emergencyContact,
          name: formatName(contact.firstName, contact.middleName, contact.lastName),
          nextOfKin: contact.nextOfKin,
          phones: contact.phones.map(({ number }) => number),
          relationship: contact.relationshipDescription,
        }
      })
  }

  private async addressForPerson(personId: number): Promise<{ personId: number; addresses: Address[] }> {
    const addresses = await this.prisonApiClient.getAddressesForPerson(personId)
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
      height: prisonerData.heightCentimetres.toString() || 'Not entered',
      leftEyeColour: prisonerData.leftEyeColour || 'Not entered',
      rightEyeColour: prisonerData.rightEyeColour || 'Not entered',
      shapeOfFace: prisonerData.shapeOfFace || 'Not entered',
      shoeSize: prisonerData.shoeSize.toString() || 'Not entered',
      warnedAboutTattooing:
        getProfileInformationValue(ProfileInformationType.WarnedAboutTattooing, inmateDetail.profileInformation) ||
        'Needs to be warned',
      warnedNotToChangeAppearance:
        getProfileInformationValue(
          ProfileInformationType.WarnedNotToChangeAppearance,
          inmateDetail.profileInformation,
        ) || 'Needs to be warned',
      weight: prisonerData.weightKilograms.toString() || 'Not entered',
    }
  }
}
