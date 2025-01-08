export default interface ProfileInformation {
  type: string
  question: string
  resultValue: string
}

export const getProfileInformationValue = (type: ProfileInformationType, array: ProfileInformation[]): string => {
  const value = Array.isArray(array) && array.length ? array.find(item => item.type === type) : null

  return value && value.resultValue
}

// eslint-disable-next-line no-shadow
export enum ProfileInformationType {
  RecognisedListener = 'LIST_REC',
  SuitableListener = 'LIST_SUIT',
  TypesOfDiet = 'DIET',
  SmokerOrVaper = 'SMOKE',
  DomesticAbusePerpetrator = 'DOMESTIC',
  DomesticAbuseVictim = 'DOMVIC',
  SocialCareNeeded = 'PERSC',
  NumberOfChildren = 'CHILD',
  SexualOrientation = 'SEXO',
  Nationality = 'NAT',
  OtherNationalities = 'NATIO',
  WarnedAboutTattooing = 'TAT',
  WarnedNotToChangeAppearance = 'APPEAR',
  InterestToImmigration = 'IMM',
  TravelRestrictions = 'TRAVEL',
}
