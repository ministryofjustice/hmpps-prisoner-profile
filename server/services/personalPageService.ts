import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { PersonalPage } from '../interfaces/pages/personalPage'

export default class PersonalPageService {
  private prisonApiClient: PrisonApiClient

  constructor(prisonApiClient: PrisonApiClient) {
    this.prisonApiClient = prisonApiClient
  }

  public async get(): Promise<PersonalPage> {
    return {
      personalDetails: {
        age: 'age',
        aliases: [
          {
            alias: 'alias',
            dateOfBirth: 'dateOfBirth',
          },
        ],
        dateOfBirth: 'dateOfBirth',
        domesticAbusePerpetrator: 'domesticAbusePerpetrator',
        domesticAbuseVictim: 'domesticAbuseVictim',
        ethnicGroup: 'ethnicGroup',
        fullName: 'fullName',
        languages: 'languages',
        marriageOrCivilPartnership: 'marriageOrCivilPartnership',
        nationality: 'nationality',
        numberOfChildren: 'numberOfChildren',
        otherLanguages: 'otherLanguages',
        placeOfBirth: 'placeOfBirth',
        religionOrBelief: 'religionOrBelief',
        sex: 'sex',
        sexualOrientation: 'sexualOrientation',
        smokerOrVaper: 'smokerOrVaper',
        socialCareNeeded: 'socialCareNeeded',
        typeOfDiet: 'typesOfDiet',
      },
    }
  }
}
