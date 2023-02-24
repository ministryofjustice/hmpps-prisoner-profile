import { InmateDetail, ProfileInformation, ProfileInformationType } from '../../interfaces/inmateDetail'

export const recognisedListenerYes: ProfileInformation = {
  type: ProfileInformationType.RecognisedListener,
  question: 'Recognised Listener?',
  resultValue: 'Yes',
}

export const recognisedListenerNo: ProfileInformation = {
  type: ProfileInformationType.RecognisedListener,
  question: 'Recognised Listener?',
  resultValue: 'No',
}

export const recognisedListenerBlank: ProfileInformation = {
  type: ProfileInformationType.RecognisedListener,
  question: 'Recognised Listener?',
  resultValue: '',
}

export const suitableListenerYes: ProfileInformation = {
  type: ProfileInformationType.SuitableListener,
  question: 'Suitable Listener?',
  resultValue: 'Yes',
}

export const suitableListenerNo: ProfileInformation = {
  type: ProfileInformationType.SuitableListener,
  question: 'Suitable Listener?',
  resultValue: 'No',
}

export const suitableListenerBlank: ProfileInformation = {
  type: ProfileInformationType.SuitableListener,
  question: 'Suitable Listener?',
  resultValue: '',
}

export const inmateDetailMock: InmateDetail = {
  profileInformation: [recognisedListenerYes],
}
