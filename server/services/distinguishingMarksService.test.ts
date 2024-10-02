import { PrisonPersonApiClient } from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import DistinguishingMarksService from './distinguishingMarksService'

const prisonPersonApiClient = {
  postDistinguishingMark: jest.fn(),
} as undefined as PrisonPersonApiClient

describe('distinguishingMarksService', () => {
  let service: DistinguishingMarksService
  beforeEach(() => {
    service = new DistinguishingMarksService(() => prisonPersonApiClient)
  })

  describe('postNewDistinguishingMark', () => {
    test.each`
      bodyPart       | distinguishingMarkRequest
      ${'back'}      | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_B' }}
      ${'face'}      | ${{ bodyPart: 'BODY_PART_FACE' }}
      ${'head'}      | ${{ bodyPart: 'BODY_PART_HEAD' }}
      ${'leftArm'}   | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_L' }}
      ${'rightArm'}  | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_R' }}
      ${'leftFoot'}  | ${{ bodyPart: 'BODY_PART_FOOT', side: 'SIDE_L' }}
      ${'rightFoot'} | ${{ bodyPart: 'BODY_PART_FOOT', side: 'SIDE_R' }}
      ${'leftLeg'}   | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_L' }}
      ${'rightLeg'}  | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_R' }}
      ${'leftHand'}  | ${{ bodyPart: 'BODY_PART_HAND', side: 'SIDE_L' }}
      ${'rightHand'} | ${{ bodyPart: 'BODY_PART_HAND', side: 'SIDE_R' }}
      ${'neck'}      | ${{ bodyPart: 'BODY_PART_NECK' }}
      ${'torso'}     | ${{ bodyPart: 'BODY_PART_TORSO' }}
    `(
      'should call post with $distinguishingMarkRequest when bodyPart is $bodyPart',
      ({ bodyPart, distinguishingMarkRequest }) => {
        service.postNewDistinguishingMark('token', 'A12345', 'tattoo', bodyPart)

        expect(prisonPersonApiClient.postDistinguishingMark).toHaveBeenCalledWith({
          prisonerNumber: 'A12345',
          markType: 'MARK_TYPE_TAT',
          ...distinguishingMarkRequest,
        })
      },
    )
  })
})
