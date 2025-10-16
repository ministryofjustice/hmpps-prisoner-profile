import DistinguishingMarksService from './distinguishingMarksService'
import MulterFile from '../controllers/interfaces/MulterFile'
import { PersonIntegrationApiClient } from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { DistinguishingMarksMock } from '../data/localMockData/personIntegrationApiReferenceDataMock'
import MetricsService from './metrics/metricsService'
import { metricsServiceMock } from '../../tests/mocks/metricsServiceMock'
import { PrisonUser } from '../interfaces/HmppsUser'

const personIntegrationApiClient = {
  getDistinguishingMark: jest.fn(),
  getDistinguishingMarks: jest.fn(),
  createDistinguishingMark: jest.fn(),
  updateDistinguishingMark: jest.fn(),
  addDistinguishingMarkImage: jest.fn(),
  updateDistinguishingMarkImage: jest.fn(),
  getDistinguishingMarkImage: jest.fn(),
} as undefined as PersonIntegrationApiClient

describe('distinguishingMarksService', () => {
  const prisonerNumber = 'A12345'

  let service: DistinguishingMarksService
  let metricsService: MetricsService
  let user: PrisonUser

  beforeEach(() => {
    metricsService = metricsServiceMock()
    service = new DistinguishingMarksService(() => personIntegrationApiClient, metricsService)
    user = { username: 'testuser' } as PrisonUser
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('postNewDistinguishingMark', () => {
    test.each`
      bodyPart           | distinguishingMarkRequest
      ${'back'}          | ${{ bodyPart: 'TORSO', side: 'B' }}
      ${'face'}          | ${{ bodyPart: 'FACE' }}
      ${'head'}          | ${{ bodyPart: 'HEAD' }}
      ${'leftArm'}       | ${{ bodyPart: 'ARM', side: 'L' }}
      ${'rightArm'}      | ${{ bodyPart: 'ARM', side: 'R' }}
      ${'leftFoot'}      | ${{ bodyPart: 'FOOT', side: 'L' }}
      ${'rightFoot'}     | ${{ bodyPart: 'FOOT', side: 'R' }}
      ${'leftLeg'}       | ${{ bodyPart: 'LEG', side: 'L' }}
      ${'rightLeg'}      | ${{ bodyPart: 'LEG', side: 'R' }}
      ${'leftHand'}      | ${{ bodyPart: 'HAND', side: 'L' }}
      ${'rightHand'}     | ${{ bodyPart: 'HAND', side: 'R' }}
      ${'neck'}          | ${{ bodyPart: 'NECK' }}
      ${'torso'}         | ${{ bodyPart: 'TORSO' }}
      ${'rightTorso'}    | ${{ bodyPart: 'TORSO', side: 'R' }}
      ${'leftTorso'}     | ${{ bodyPart: 'TORSO', side: 'L' }}
      ${'leftAnkle'}     | ${{ bodyPart: 'ANKLE', side: 'L' }}
      ${'rightAnkle'}    | ${{ bodyPart: 'ANKLE', side: 'R' }}
      ${'ear'}           | ${{ bodyPart: 'EAR' }}
      ${'leftFinger'}    | ${{ bodyPart: 'FINGER', side: 'L' }}
      ${'rightFinger'}   | ${{ bodyPart: 'FINGER', side: 'R' }}
      ${'leftKnee'}      | ${{ bodyPart: 'KNEE', side: 'L' }}
      ${'rightKnee'}     | ${{ bodyPart: 'KNEE', side: 'R' }}
      ${'lip'}           | ${{ bodyPart: 'LIP' }}
      ${'nose'}          | ${{ bodyPart: 'NOSE' }}
      ${'rightShoulder'} | ${{ bodyPart: 'SHOULDER', side: 'R' }}
      ${'leftShoulder'}  | ${{ bodyPart: 'SHOULDER', side: 'L' }}
      ${'rightThigh'}    | ${{ bodyPart: 'THIGH', side: 'R' }}
      ${'leftThigh'}     | ${{ bodyPart: 'THIGH', side: 'L' }}
      ${'rightToe'}      | ${{ bodyPart: 'TOE', side: 'R' }}
      ${'leftToe'}       | ${{ bodyPart: 'TOE', side: 'L' }}
      ${'upperRightArm'} | ${{ bodyPart: 'ARM', side: 'R', partOrientation: 'UPP' }}
      ${'lowerRightArm'} | ${{ bodyPart: 'ARM', side: 'R', partOrientation: 'LOW' }}
      ${'upperLeftArm'}  | ${{ bodyPart: 'ARM', side: 'L', partOrientation: 'UPP' }}
      ${'lowerLeftArm'}  | ${{ bodyPart: 'ARM', side: 'L', partOrientation: 'LOW' }}
      ${'lowerLeftLeg'}  | ${{ bodyPart: 'LEG', side: 'L', partOrientation: 'LOW' }}
      ${'lowerRightLeg'} | ${{ bodyPart: 'LEG', side: 'R', partOrientation: 'LOW' }}
      ${'upperBack'}     | ${{ bodyPart: 'TORSO', side: 'B', partOrientation: 'UPP' }}
      ${'lowerBack'}     | ${{ bodyPart: 'TORSO', side: 'B', partOrientation: 'LOW' }}
      ${'leftElbow'}     | ${{ bodyPart: 'ELBOW', side: 'L' }}
      ${'rightElbow'}    | ${{ bodyPart: 'ELBOW', side: 'R' }}
    `(
      'should call post with $distinguishingMarkRequest when bodyPart is $bodyPart',
      ({ bodyPart, distinguishingMarkRequest }) => {
        service.postNewDistinguishingMark('token', user, prisonerNumber, 'tattoo', bodyPart)

        expect(personIntegrationApiClient.createDistinguishingMark).toHaveBeenCalledWith(
          prisonerNumber,
          {
            markType: 'TAT',
            ...distinguishingMarkRequest,
          },
          undefined,
        )
        expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
          fieldsUpdated: ['distinguishing-marks'],
          prisonerNumber,
          user,
        })
      },
    )

    it('should include comment if provided', () => {
      service.postNewDistinguishingMark('token', user, prisonerNumber, 'tattoo', 'neck', 'comment')

      expect(personIntegrationApiClient.createDistinguishingMark).toHaveBeenCalledWith(
        prisonerNumber,
        {
          markType: 'TAT',
          bodyPart: 'NECK',
          comment: 'comment',
        },
        undefined,
      )
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['distinguishing-marks'],
        prisonerNumber,
        user,
      })
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
      service.postNewDistinguishingMark('token', user, prisonerNumber, 'tattoo', 'neck', 'comment', image)

      expect(personIntegrationApiClient.createDistinguishingMark).toHaveBeenCalledWith(
        prisonerNumber,
        {
          markType: 'TAT',
          bodyPart: 'NECK',
          comment: 'comment',
        },
        image,
      )
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['distinguishing-marks'],
        prisonerNumber,
        user,
      })
    })
  })

  describe('getDistinguishingMark', () => {
    it('should call getDistinguishingMark', () => {
      service.getDistinguishingMark('token', prisonerNumber, '1')

      expect(personIntegrationApiClient.getDistinguishingMark).toHaveBeenCalledWith(prisonerNumber, '1')
    })
  })

  describe('updateDistinguishingMarkLocation', () => {
    test.each`
      bodyPartName       | distinguishingMarkRequest
      ${'back'}          | ${{ bodyPart: 'TORSO', side: 'B' }}
      ${'face'}          | ${{ bodyPart: 'FACE' }}
      ${'head'}          | ${{ bodyPart: 'HEAD' }}
      ${'leftArm'}       | ${{ bodyPart: 'ARM', side: 'L' }}
      ${'rightArm'}      | ${{ bodyPart: 'ARM', side: 'R' }}
      ${'leftFoot'}      | ${{ bodyPart: 'FOOT', side: 'L' }}
      ${'rightFoot'}     | ${{ bodyPart: 'FOOT', side: 'R' }}
      ${'leftLeg'}       | ${{ bodyPart: 'LEG', side: 'L' }}
      ${'rightLeg'}      | ${{ bodyPart: 'LEG', side: 'R' }}
      ${'leftHand'}      | ${{ bodyPart: 'HAND', side: 'L' }}
      ${'rightHand'}     | ${{ bodyPart: 'HAND', side: 'R' }}
      ${'neck'}          | ${{ bodyPart: 'NECK' }}
      ${'torso'}         | ${{ bodyPart: 'TORSO' }}
      ${'rightTorso'}    | ${{ bodyPart: 'TORSO', side: 'R' }}
      ${'leftTorso'}     | ${{ bodyPart: 'TORSO', side: 'L' }}
      ${'leftAnkle'}     | ${{ bodyPart: 'ANKLE', side: 'L' }}
      ${'rightAnkle'}    | ${{ bodyPart: 'ANKLE', side: 'R' }}
      ${'ear'}           | ${{ bodyPart: 'EAR' }}
      ${'leftFinger'}    | ${{ bodyPart: 'FINGER', side: 'L' }}
      ${'rightFinger'}   | ${{ bodyPart: 'FINGER', side: 'R' }}
      ${'leftKnee'}      | ${{ bodyPart: 'KNEE', side: 'L' }}
      ${'rightKnee'}     | ${{ bodyPart: 'KNEE', side: 'R' }}
      ${'lip'}           | ${{ bodyPart: 'LIP' }}
      ${'nose'}          | ${{ bodyPart: 'NOSE' }}
      ${'rightShoulder'} | ${{ bodyPart: 'SHOULDER', side: 'R' }}
      ${'leftShoulder'}  | ${{ bodyPart: 'SHOULDER', side: 'L' }}
      ${'rightThigh'}    | ${{ bodyPart: 'THIGH', side: 'R' }}
      ${'leftThigh'}     | ${{ bodyPart: 'THIGH', side: 'L' }}
      ${'rightToe'}      | ${{ bodyPart: 'TOE', side: 'R' }}
      ${'leftToe'}       | ${{ bodyPart: 'TOE', side: 'L' }}
      ${'upperRightArm'} | ${{ bodyPart: 'ARM', side: 'R', partOrientation: 'UPP' }}
      ${'lowerRightArm'} | ${{ bodyPart: 'ARM', side: 'R', partOrientation: 'LOW' }}
      ${'upperLeftArm'}  | ${{ bodyPart: 'ARM', side: 'L', partOrientation: 'UPP' }}
      ${'lowerLeftArm'}  | ${{ bodyPart: 'ARM', side: 'L', partOrientation: 'LOW' }}
      ${'lowerLeftLeg'}  | ${{ bodyPart: 'LEG', side: 'L', partOrientation: 'LOW' }}
      ${'lowerRightLeg'} | ${{ bodyPart: 'LEG', side: 'R', partOrientation: 'LOW' }}
      ${'upperBack'}     | ${{ bodyPart: 'TORSO', side: 'B', partOrientation: 'UPP' }}
      ${'lowerBack'}     | ${{ bodyPart: 'TORSO', side: 'B', partOrientation: 'LOW' }}
      ${'leftElbow'}     | ${{ bodyPart: 'ELBOW', side: 'L' }}
      ${'rightElbow'}    | ${{ bodyPart: 'ELBOW', side: 'R' }}
    `(
      'should call post with $distinguishingMarkRequest when bodyPart is $bodyPart',
      ({ bodyPartName, distinguishingMarkRequest }) => {
        service.updateDistinguishingMarkLocation(
          'token',
          user,
          prisonerNumber,
          '1',
          DistinguishingMarksMock[0],
          'tattoo',
          bodyPartName,
        )

        const { bodyPart, side, partOrientation } = distinguishingMarkRequest
        expect(personIntegrationApiClient.updateDistinguishingMark).toHaveBeenCalledWith(prisonerNumber, '1', {
          markType: 'TAT',
          bodyPart,
          side,
          partOrientation,
          comment: 'Some comment',
        })
        expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
          fieldsUpdated: ['distinguishing-marks'],
          prisonerNumber,
          user,
        })
      },
    )
  })

  describe('updateDistinguishingMarkDescription', () => {
    it('should include comment if provided', () => {
      service.updateDistinguishingMarkDescription(
        'token',
        user,
        prisonerNumber,
        '1',
        DistinguishingMarksMock[0],
        'tattoo',
        'comment',
      )

      expect(personIntegrationApiClient.updateDistinguishingMark).toHaveBeenCalledWith(prisonerNumber, '1', {
        markType: 'TAT',
        bodyPart: 'HEAD',
        side: 'L',
        partOrientation: 'UPP',
        comment: 'comment',
      })
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['distinguishing-marks'],
        prisonerNumber,
        user,
      })
    })
  })

  describe('updateDistinguishingMarkPhoto', () => {
    it('should update correct photo', () => {
      service.updateDistinguishingMarkPhoto('token', user, prisonerNumber, '123', {
        originalname: 'photo',
      } as MulterFile)

      expect(personIntegrationApiClient.updateDistinguishingMarkImage).toHaveBeenCalledWith('123', {
        originalname: 'photo',
      })
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['distinguishing-marks'],
        prisonerNumber,
        user,
      })
    })
  })

  describe('addDistinguishingMarkPhoto', () => {
    it('should add correct photo', () => {
      service.addDistinguishingMarkPhoto('token', user, prisonerNumber, '1', {
        originalname: 'photo',
      } as MulterFile)

      expect(personIntegrationApiClient.addDistinguishingMarkImage).toHaveBeenCalledWith(prisonerNumber, '1', {
        originalname: 'photo',
      })
      expect(metricsService.trackPersonIntegrationUpdate).toHaveBeenCalledWith({
        fieldsUpdated: ['distinguishing-marks'],
        prisonerNumber,
        user,
      })
    })
  })
})
