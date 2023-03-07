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
    languages: string
    marriageOrCivilPartnership: string
    nationality: string
    numberOfChildren: string
    otherLanguages: string
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
