import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { PersonalPage } from '../interfaces/pages/personalPage'
import { Prisoner } from '../interfaces/prisoner'
import { toFullName, yearsBetweenDateStrings } from '../utils/utils'
import { getProfileInformationValue, ProfileInformationType } from '../interfaces/prisonApi/profileInformation'

export default class PersonalPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner): Promise<PersonalPage> {
    const inmateDetail = await this.prisonApiClient.getInmateDetail(prisonerData.bookingId)
    const prisonerDetail = await this.prisonApiClient.getPrisoner(prisonerData.prisonerNumber)
    const secondaryLanguages = await this.prisonApiClient.getSecondaryLanguages(prisonerData.bookingId)
    const { profileInformation } = inmateDetail

    const aliases = prisonerData.aliases.map(({ firstName, middleNames, lastName, dateOfBirth }) => ({
      alias: toFullName({ firstName, middleNames, lastName }),
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
        fullName: toFullName({
          firstName: prisonerData.firstName,
          middleNames: prisonerData.middleNames,
          lastName: prisonerData.lastName,
        }),
        languages: {
          written: inmateDetail.language,
          spoken: inmateDetail.writtenLanguage,
          interpreterRequired: inmateDetail.interpreterRequired,
        },
        marriageOrCivilPartnership: prisonerData.maritalStatus || 'Not entered',
        nationality: prisonerData.nationality,
        numberOfChildren:
          getProfileInformationValue(ProfileInformationType.NumberOfChildren, profileInformation) || 'Not entered',
        otherLanguages: secondaryLanguages.map(({ description, canRead, canSpeak, canWrite }) => ({
          language: description,
          canRead,
          canSpeak,
          canWrite,
        })),
        otherNationalities: getProfileInformationValue(ProfileInformationType.OtherNationalities, profileInformation),
        placeOfBirth: inmateDetail.birthPlace || 'Not entered',
        preferredName: toFullName({
          firstName: prisonerDetail.currentWorkingFirstName,
          lastName: prisonerDetail.currentWorkingLastName,
        }),
        religionOrBelief: prisonerData.religion || 'Not entered',
        sex: prisonerData.gender,
        sexualOrientation:
          getProfileInformationValue(ProfileInformationType.SexualOrientation, profileInformation) || 'Not entered',
        smokerOrVaper:
          getProfileInformationValue(ProfileInformationType.SmokerOrVaper, profileInformation) || 'Not entered',
        socialCareNeeded: getProfileInformationValue(ProfileInformationType.SocialCareNeeded, profileInformation),
        typeOfDiet: getProfileInformationValue(ProfileInformationType.TypesOfDiet, profileInformation) || 'Not entered',
      },
    }
  }
}
