import { PrisonPersonApiClient } from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import DistinguishingMarksService from './distinguishingMarksService'
import MulterFile from '../controllers/interfaces/MulterFile'

const prisonPersonApiClient = {
  postDistinguishingMark: jest.fn(),
  getDistinguishingMark: jest.fn(),
  patchDistinguishingMark: jest.fn(),
  postDistinguishingMarkPhoto: jest.fn(),
} as undefined as PrisonPersonApiClient

describe('distinguishingMarksService', () => {
  let service: DistinguishingMarksService
  beforeEach(() => {
    service = new DistinguishingMarksService(() => prisonPersonApiClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('postNewDistinguishingMark', () => {
    test.each`
      bodyPart           | distinguishingMarkRequest
      ${'back'}          | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_B' }}
      ${'face'}          | ${{ bodyPart: 'BODY_PART_FACE' }}
      ${'head'}          | ${{ bodyPart: 'BODY_PART_HEAD' }}
      ${'leftArm'}       | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_L' }}
      ${'rightArm'}      | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_R' }}
      ${'leftFoot'}      | ${{ bodyPart: 'BODY_PART_FOOT', side: 'SIDE_L' }}
      ${'rightFoot'}     | ${{ bodyPart: 'BODY_PART_FOOT', side: 'SIDE_R' }}
      ${'leftLeg'}       | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_L' }}
      ${'rightLeg'}      | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_R' }}
      ${'leftHand'}      | ${{ bodyPart: 'BODY_PART_HAND', side: 'SIDE_L' }}
      ${'rightHand'}     | ${{ bodyPart: 'BODY_PART_HAND', side: 'SIDE_R' }}
      ${'neck'}          | ${{ bodyPart: 'BODY_PART_NECK' }}
      ${'torso'}         | ${{ bodyPart: 'BODY_PART_TORSO' }}
      ${'rightTorso'}    | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_R' }}
      ${'leftTorso'}     | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_L' }}
      ${'leftAnkle'}     | ${{ bodyPart: 'BODY_PART_ANKLE', side: 'SIDE_L' }}
      ${'rightAnkle'}    | ${{ bodyPart: 'BODY_PART_ANKLE', side: 'SIDE_R' }}
      ${'ear'}           | ${{ bodyPart: 'BODY_PART_EAR' }}
      ${'leftFinger'}    | ${{ bodyPart: 'BODY_PART_FINGER', side: 'SIDE_L' }}
      ${'rightFinger'}   | ${{ bodyPart: 'BODY_PART_FINGER', side: 'SIDE_R' }}
      ${'leftKnee'}      | ${{ bodyPart: 'BODY_PART_KNEE', side: 'SIDE_L' }}
      ${'rightKnee'}     | ${{ bodyPart: 'BODY_PART_KNEE', side: 'SIDE_R' }}
      ${'lip'}           | ${{ bodyPart: 'BODY_PART_LIP' }}
      ${'nose'}          | ${{ bodyPart: 'BODY_PART_NOSE' }}
      ${'rightShoulder'} | ${{ bodyPart: 'BODY_PART_SHOULDER', side: 'SIDE_R' }}
      ${'leftShoulder'}  | ${{ bodyPart: 'BODY_PART_SHOULDER', side: 'SIDE_L' }}
      ${'rightThigh'}    | ${{ bodyPart: 'BODY_PART_THIGH', side: 'SIDE_R' }}
      ${'leftThigh'}     | ${{ bodyPart: 'BODY_PART_THIGH', side: 'SIDE_L' }}
      ${'rightToe'}      | ${{ bodyPart: 'BODY_PART_TOE', side: 'SIDE_R' }}
      ${'leftToe'}       | ${{ bodyPart: 'BODY_PART_TOE', side: 'SIDE_L' }}
      ${'upperRightArm'} | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_R', partOrientation: 'PART_ORIENT_UPP' }}
      ${'lowerRightArm'} | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_R', partOrientation: 'PART_ORIENT_LOW' }}
      ${'upperLeftArm'}  | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_L', partOrientation: 'PART_ORIENT_UPP' }}
      ${'lowerLeftArm'}  | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_L', partOrientation: 'PART_ORIENT_LOW' }}
      ${'lowerLeftLeg'}  | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_L', partOrientation: 'PART_ORIENT_LOW' }}
      ${'lowerRightLeg'} | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_R', partOrientation: 'PART_ORIENT_LOW' }}
      ${'upperBack'}     | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_B', partOrientation: 'PART_ORIENT_UPP' }}
      ${'lowerBack'}     | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_B', partOrientation: 'PART_ORIENT_LOW' }}
      ${'leftElbow'}     | ${{ bodyPart: 'BODY_PART_ELBOW', side: 'SIDE_L' }}
      ${'rightElbow'}    | ${{ bodyPart: 'BODY_PART_ELBOW', side: 'SIDE_R' }}
    `(
      'should call post with $distinguishingMarkRequest when bodyPart is $bodyPart',
      ({ bodyPart, distinguishingMarkRequest }) => {
        service.postNewDistinguishingMark('token', 'A12345', 'tattoo', bodyPart)

        expect(prisonPersonApiClient.postDistinguishingMark).toHaveBeenCalledWith(
          {
            prisonerNumber: 'A12345',
            markType: 'MARK_TYPE_TAT',
            ...distinguishingMarkRequest,
          },
          undefined,
        )
      },
    )

    it('should include comment if provided', () => {
      service.postNewDistinguishingMark('token', 'A12345', 'tattoo', 'neck', 'comment')

      expect(prisonPersonApiClient.postDistinguishingMark).toHaveBeenCalledWith(
        {
          prisonerNumber: 'A12345',
          markType: 'MARK_TYPE_TAT',
          bodyPart: 'BODY_PART_NECK',
          comment: 'comment',
        },
        undefined,
      )
    })

    it('should include image if provided', () => {
      const image: MulterFile = {
        buffer: Buffer.from('image'),
        originalname: 'image',
        mimetype: 'image/png',
        size: 123,
        filename: 'image',
        path: 'path',
        fieldname: 'field',
        stream: undefined,
        destination: 'destination',
        encoding: 'utf-8',
      }
      service.postNewDistinguishingMark('token', 'A12345', 'tattoo', 'neck', 'comment', image)

      expect(prisonPersonApiClient.postDistinguishingMark).toHaveBeenCalledWith(
        {
          prisonerNumber: 'A12345',
          markType: 'MARK_TYPE_TAT',
          bodyPart: 'BODY_PART_NECK',
          comment: 'comment',
        },
        image,
      )
    })
  })

  describe('getDistinguishingMark', () => {
    it('should call getDistinguishingMark', () => {
      service.getDistinguishingMark('token', 'markId')

      expect(prisonPersonApiClient.getDistinguishingMark).toHaveBeenCalledWith('markId')
    })
  })

  describe('updateDistinguishingMarkLocation', () => {
    test.each`
      bodyPartName       | distinguishingMarkRequest
      ${'back'}          | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_B' }}
      ${'face'}          | ${{ bodyPart: 'BODY_PART_FACE' }}
      ${'head'}          | ${{ bodyPart: 'BODY_PART_HEAD' }}
      ${'leftArm'}       | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_L' }}
      ${'rightArm'}      | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_R' }}
      ${'leftFoot'}      | ${{ bodyPart: 'BODY_PART_FOOT', side: 'SIDE_L' }}
      ${'rightFoot'}     | ${{ bodyPart: 'BODY_PART_FOOT', side: 'SIDE_R' }}
      ${'leftLeg'}       | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_L' }}
      ${'rightLeg'}      | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_R' }}
      ${'leftHand'}      | ${{ bodyPart: 'BODY_PART_HAND', side: 'SIDE_L' }}
      ${'rightHand'}     | ${{ bodyPart: 'BODY_PART_HAND', side: 'SIDE_R' }}
      ${'neck'}          | ${{ bodyPart: 'BODY_PART_NECK' }}
      ${'torso'}         | ${{ bodyPart: 'BODY_PART_TORSO' }}
      ${'rightTorso'}    | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_R' }}
      ${'leftTorso'}     | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_L' }}
      ${'leftAnkle'}     | ${{ bodyPart: 'BODY_PART_ANKLE', side: 'SIDE_L' }}
      ${'rightAnkle'}    | ${{ bodyPart: 'BODY_PART_ANKLE', side: 'SIDE_R' }}
      ${'ear'}           | ${{ bodyPart: 'BODY_PART_EAR' }}
      ${'leftFinger'}    | ${{ bodyPart: 'BODY_PART_FINGER', side: 'SIDE_L' }}
      ${'rightFinger'}   | ${{ bodyPart: 'BODY_PART_FINGER', side: 'SIDE_R' }}
      ${'leftKnee'}      | ${{ bodyPart: 'BODY_PART_KNEE', side: 'SIDE_L' }}
      ${'rightKnee'}     | ${{ bodyPart: 'BODY_PART_KNEE', side: 'SIDE_R' }}
      ${'lip'}           | ${{ bodyPart: 'BODY_PART_LIP' }}
      ${'nose'}          | ${{ bodyPart: 'BODY_PART_NOSE' }}
      ${'rightShoulder'} | ${{ bodyPart: 'BODY_PART_SHOULDER', side: 'SIDE_R' }}
      ${'leftShoulder'}  | ${{ bodyPart: 'BODY_PART_SHOULDER', side: 'SIDE_L' }}
      ${'rightThigh'}    | ${{ bodyPart: 'BODY_PART_THIGH', side: 'SIDE_R' }}
      ${'leftThigh'}     | ${{ bodyPart: 'BODY_PART_THIGH', side: 'SIDE_L' }}
      ${'rightToe'}      | ${{ bodyPart: 'BODY_PART_TOE', side: 'SIDE_R' }}
      ${'leftToe'}       | ${{ bodyPart: 'BODY_PART_TOE', side: 'SIDE_L' }}
      ${'upperRightArm'} | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_R', partOrientation: 'PART_ORIENT_UPP' }}
      ${'lowerRightArm'} | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_R', partOrientation: 'PART_ORIENT_LOW' }}
      ${'upperLeftArm'}  | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_L', partOrientation: 'PART_ORIENT_UPP' }}
      ${'lowerLeftArm'}  | ${{ bodyPart: 'BODY_PART_ARM', side: 'SIDE_L', partOrientation: 'PART_ORIENT_LOW' }}
      ${'lowerLeftLeg'}  | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_L', partOrientation: 'PART_ORIENT_LOW' }}
      ${'lowerRightLeg'} | ${{ bodyPart: 'BODY_PART_LEG', side: 'SIDE_R', partOrientation: 'PART_ORIENT_LOW' }}
      ${'upperBack'}     | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_B', partOrientation: 'PART_ORIENT_UPP' }}
      ${'lowerBack'}     | ${{ bodyPart: 'BODY_PART_TORSO', side: 'SIDE_B', partOrientation: 'PART_ORIENT_LOW' }}
      ${'leftElbow'}     | ${{ bodyPart: 'BODY_PART_ELBOW', side: 'SIDE_L' }}
      ${'rightElbow'}    | ${{ bodyPart: 'BODY_PART_ELBOW', side: 'SIDE_R' }}
    `(
      'should call post with $distinguishingMarkRequest when bodyPart is $bodyPart',
      ({ bodyPartName, distinguishingMarkRequest }) => {
        service.updateDistinguishingMarkLocation(
          'token',
          'A12345',
          '019205c0-0fd5-7c41-ae24-ede9eae05da5',
          'tattoo',
          bodyPartName,
        )

        const { bodyPart, side, partOrientation } = distinguishingMarkRequest
        expect(prisonPersonApiClient.patchDistinguishingMark).toHaveBeenCalledWith({
          prisonerNumber: 'A12345',
          markId: '019205c0-0fd5-7c41-ae24-ede9eae05da5',
          markType: 'MARK_TYPE_TAT',
          bodyPart,
          side: side ?? null,
          partOrientation: partOrientation ?? null,
        })
      },
    )
  })

  describe('updateDistinguishingMarkDescription', () => {
    it('should include comment if provided', () => {
      service.updateDistinguishingMarkDescription(
        'token',
        'A12345',
        '019205c0-0fd5-7c41-ae24-ede9eae05da5',
        'tattoo',
        'comment',
      )

      expect(prisonPersonApiClient.patchDistinguishingMark).toHaveBeenCalledWith({
        prisonerNumber: 'A12345',
        markId: '019205c0-0fd5-7c41-ae24-ede9eae05da5',
        markType: 'MARK_TYPE_TAT',
        comment: 'comment',
      })
    })
  })

  describe('addDistinguishingMarkPhoto', () => {
    it('should add correct photo', () => {
      service.addDistinguishingMarkPhoto('token', '019205c0-0fd5-7c41-ae24-ede9eae05da5', {
        originalname: 'photo',
      } as MulterFile)

      expect(prisonPersonApiClient.postDistinguishingMarkPhoto).toHaveBeenCalledWith(
        '019205c0-0fd5-7c41-ae24-ede9eae05da5',
        { originalname: 'photo' },
      )
    })
  })
})
