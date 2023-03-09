export interface PersonalPage {
  personalDetails: {
    age: string
    aliases: {
      alias: string
      dateOfBirth: string
    }[]
    dateOfBirth: string
    domesticAbusePerpetrator: string
    domesticAbuseVictim: string
    ethnicGroup: string
    fullName: string
    languages: {
      spoken: string
      written: string
      interpreterRequired: boolean
    }
    marriageOrCivilPartnership: string
    nationality: string
    numberOfChildren: string
    otherLanguages: {
      language: string
      canRead: boolean
      canSpeak: boolean
      canWrite: boolean
    }[]
    otherNationalities: string
    placeOfBirth: string
    preferredName: string
    religionOrBelief: string
    sex: string
    sexualOrientation: string
    smokerOrVaper: string
    socialCareNeeded: string
    typeOfDiet: string
  }
}
