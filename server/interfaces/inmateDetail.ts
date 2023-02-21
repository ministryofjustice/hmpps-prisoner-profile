export interface InmateDetail {
  profileInformation: ProfileInformation[]
}

export interface ProfileInformation {
  type: string
  question: string
  resultValue: string
}

export const getProfileInformationValue = (type: ProfileInformationType, array: ProfileInformation[]) => {
  const value = Array.isArray(array) && array.length ? array.find(item => item.type === type) : null

  return value && value.resultValue
}

// eslint-disable-next-line no-shadow
export enum ProfileInformationType {
  RecognisedListener = 'LIST_REC',
  SuitableListener = 'LIST_SUIT',
}
