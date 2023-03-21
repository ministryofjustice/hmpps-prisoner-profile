import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { PersonalPage } from '../interfaces/pages/personalPage'
import { Prisoner } from '../interfaces/prisoner'
import { formatName, yearsBetweenDateStrings } from '../utils/utils'
import { getProfileInformationValue, ProfileInformationType } from '../interfaces/prisonApi/profileInformation'
import { getOffenderIdentifierValue, OffenderIdentifierType } from '../interfaces/prisonApi/offenderIdentifier'

export default class PersonalPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner): Promise<PersonalPage> {
    const { bookingId, prisonerNumber } = prisonerData
    const [inmateDetail, prisonerDetail, secondaryLanguages, property] = await Promise.all([
      this.prisonApiClient.getInmateDetail(bookingId),
      this.prisonApiClient.getPrisoner(prisonerNumber),
      this.prisonApiClient.getSecondaryLanguages(bookingId),
      this.prisonApiClient.getProperty(bookingId),
    ])

    const { profileInformation } = inmateDetail

    const aliases = prisonerData.aliases.map(({ firstName, middleNames, lastName, dateOfBirth }) => ({
      alias: formatName(firstName, middleNames, lastName),
      dateOfBirth,
    }))

    const todaysDateString = new Date().toISOString()

    return {
      personalDetails: {
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
      },
      identityNumbers: {
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
      },
      property: property.map(({ location, containerType, sealMark }) => ({
        containerType,
        sealMark: sealMark || 'Not entered',
        location: location?.userDescription || 'Not entered',
      })),
    }
  }
}
