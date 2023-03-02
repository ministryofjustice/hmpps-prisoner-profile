import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { PersonalPage } from '../interfaces/pages/personalPage'
import { Prisoner } from '../interfaces/prisoner'

export default class PersonalPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(prisonerData: Prisoner): Promise<PersonalPage> {
    // const inmateDetail = await this.prisonApiClient.getInmateDetail(prisonerData.bookingId)
    const toFullName = (firstName: string, middleNames: string, lastName: string) =>
      [firstName, middleNames, lastName].filter(s => s !== undefined).join(' ')

    const aliases = prisonerData.aliases.map(({ firstName, middleNames, lastName, dateOfBirth }) => ({
      alias: toFullName(firstName, middleNames, lastName),
      dateOfBirth,
    }))

    return {
      personalDetails: {
        age: '123',
        aliases,
        dateOfBirth: prisonerData.dateOfBirth,
        domesticAbusePerpetrator: 'domesticAbusePerpetrator',
        domesticAbuseVictim: 'domesticAbuseVictim',
        ethnicGroup: prisonerData.ethnicity,
        fullName: toFullName(prisonerData.firstName, prisonerData.middleNames, prisonerData.lastName),
        languages: 'languages',
        marriageOrCivilPartnership: prisonerData.maritalStatus,
        nationality: prisonerData.nationality,
        numberOfChildren: 'numberOfChildren',
        otherLanguages: 'otherLanguages',
        placeOfBirth: 'placeOfBirth',
        religionOrBelief: prisonerData.religion,
        sex: prisonerData.gender,
        sexualOrientation: 'sexualOrientation',
        smokerOrVaper: 'smokerOrVaper',
        socialCareNeeded: 'socialCareNeeded',
        typeOfDiet: 'typesOfDiet',
      },
    }
  }
}
