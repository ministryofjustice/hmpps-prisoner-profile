import { InmateDetail, ProfileInformationType } from '../../interfaces/inmateDetail'

// eslint-disable-next-line import/prefer-default-export
export const inmateDetailMock: InmateDetail = {
  profileInformation: [
    {
      type: ProfileInformationType.RecognisedListener,
      question: 'Recognised Listener?',
      resultValue: 'Yes',
    },
  ],
}
