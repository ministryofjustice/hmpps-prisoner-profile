import { Readable } from 'stream'
import { RestClientBuilder } from '../data'
import filterEmptyFieldsFromObject from '../utils/filterEmptyFieldsFromObject'
import {
  AllBodyPartSelection,
  BodyPartSelection,
  MarkTypeSelection,
} from '../controllers/interfaces/distinguishingMarks/selectionTypes'
import MulterFile from '../controllers/interfaces/MulterFile'
import {
  BodyPartId,
  BodyPartSideId,
  MarkTypeId,
  PartOrientationId,
  PersonIntegrationDistinguishingMark,
  DistinguishingMarkRequest,
  PersonIntegrationApiClient,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'

const bodyPartConfig: Record<
  AllBodyPartSelection,
  { bodyPartId: BodyPartId; side?: BodyPartSideId; orientation?: PartOrientationId }
> = {
  back: { bodyPartId: 'TORSO', side: 'B' },
  face: { bodyPartId: 'FACE' },
  head: { bodyPartId: 'HEAD' },
  leftArm: { bodyPartId: 'ARM', side: 'L' },
  leftFoot: { bodyPartId: 'FOOT', side: 'L' },
  leftHand: { bodyPartId: 'HAND', side: 'L' },
  leftLeg: { bodyPartId: 'LEG', side: 'L' },
  neck: { bodyPartId: 'NECK' },
  rightArm: { bodyPartId: 'ARM', side: 'R' },
  rightFoot: { bodyPartId: 'FOOT', side: 'R' },
  rightHand: { bodyPartId: 'HAND', side: 'R' },
  rightLeg: { bodyPartId: 'LEG', side: 'R' },
  torso: { bodyPartId: 'TORSO' },
  frontTorso: { bodyPartId: 'TORSO', side: 'F' },
  rightTorso: { bodyPartId: 'TORSO', side: 'R' },
  leftTorso: { bodyPartId: 'TORSO', side: 'L' },
  leftAnkle: { bodyPartId: 'ANKLE', side: 'L' },
  rightAnkle: { bodyPartId: 'ANKLE', side: 'R' },
  ear: { bodyPartId: 'EAR' },
  leftFinger: { bodyPartId: 'FINGER', side: 'L' },
  rightFinger: { bodyPartId: 'FINGER', side: 'R' },
  leftKnee: { bodyPartId: 'KNEE', side: 'L' },
  rightKnee: { bodyPartId: 'KNEE', side: 'R' },
  lip: { bodyPartId: 'LIP' },
  nose: { bodyPartId: 'NOSE' },
  rightShoulder: { bodyPartId: 'SHOULDER', side: 'R' },
  leftShoulder: { bodyPartId: 'SHOULDER', side: 'L' },
  rightThigh: { bodyPartId: 'THIGH', side: 'R' },
  leftThigh: { bodyPartId: 'THIGH', side: 'L' },
  rightToe: { bodyPartId: 'TOE', side: 'R' },
  leftToe: { bodyPartId: 'TOE', side: 'L' },
  upperRightArm: { bodyPartId: 'ARM', side: 'R', orientation: 'UPP' },
  lowerRightArm: { bodyPartId: 'ARM', side: 'R', orientation: 'LOW' },
  upperLeftArm: { bodyPartId: 'ARM', side: 'L', orientation: 'UPP' },
  lowerLeftArm: { bodyPartId: 'ARM', side: 'L', orientation: 'LOW' },
  lowerLeftLeg: { bodyPartId: 'LEG', side: 'L', orientation: 'LOW' },
  lowerRightLeg: { bodyPartId: 'LEG', side: 'R', orientation: 'LOW' },
  upperBack: { bodyPartId: 'TORSO', side: 'B', orientation: 'UPP' },
  lowerBack: { bodyPartId: 'TORSO', side: 'B', orientation: 'LOW' },
  leftElbow: { bodyPartId: 'ELBOW', side: 'L' },
  rightElbow: { bodyPartId: 'ELBOW', side: 'R' },
}

const MarkTypeIds: Record<MarkTypeSelection, MarkTypeId> = {
  mark: 'MARK',
  scar: 'SCAR',
  tattoo: 'TAT',
}

export const findBodyPartByCodeAndSide = (targetPart: BodyPartId, targetSide: BodyPartSideId): BodyPartSelection => {
  return Object.entries(bodyPartConfig)
    .filter(([_, config]) => config.bodyPartId === targetPart && config.side === targetSide)
    .map(([key]) => key as BodyPartSelection)[0]
}

export default class DistinguishingMarksService {
  constructor(private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>) {}

  postNewDistinguishingMark(
    token: string,
    prisonerNumber: string,
    markType: MarkTypeSelection,
    bodyPart: AllBodyPartSelection,
    description?: string,
    photograph?: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark> {
    const { bodyPartId, side, orientation } = bodyPartConfig[bodyPart]
    const distinguishingMarkRequest: DistinguishingMarkRequest = {
      markType: MarkTypeIds[markType],
      bodyPart: bodyPartId,
      side,
      partOrientation: orientation,
      comment: description,
    }

    return this.personIntegrationApiClientBuilder(token).createDistinguishingMark(
      prisonerNumber,
      filterEmptyFieldsFromObject(distinguishingMarkRequest),
      photograph,
    )
  }

  getDistinguishingMark(
    token: string,
    prisonerNumber: string,
    sequenceId: string,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return this.personIntegrationApiClientBuilder(token).getDistinguishingMark(prisonerNumber, sequenceId)
  }

  updateDistinguishingMarkLocation(
    token: string,
    prisonerNumber: string,
    sequenceId: string,
    existing: PersonIntegrationDistinguishingMark,
    markType: MarkTypeSelection,
    bodyPart: AllBodyPartSelection,
  ): Promise<PersonIntegrationDistinguishingMark> {
    const { bodyPartId, side, orientation } = bodyPartConfig[bodyPart]
    const distinguishingMarkRequest: DistinguishingMarkRequest = {
      markType: MarkTypeIds[markType],
      bodyPart: bodyPartId,
      side,
      partOrientation: orientation,
      comment: existing.comment,
    }

    return this.personIntegrationApiClientBuilder(token).updateDistinguishingMark(
      prisonerNumber,
      sequenceId,
      distinguishingMarkRequest,
    )
  }

  updateDistinguishingMarkDescription(
    token: string,
    prisonerNumber: string,
    sequenceId: string,
    existing: PersonIntegrationDistinguishingMark,
    markType: MarkTypeSelection,
    comment: string,
  ): Promise<PersonIntegrationDistinguishingMark> {
    const distinguishingMarkRequest: DistinguishingMarkRequest = {
      markType: MarkTypeIds[markType],
      bodyPart: existing.bodyPart.code,
      side: existing.side?.code,
      partOrientation: existing.partOrientation?.code,
      comment,
    }

    return this.personIntegrationApiClientBuilder(token).updateDistinguishingMark(
      prisonerNumber,
      sequenceId,
      distinguishingMarkRequest,
    )
  }

  updateDistinguishingMarkPhoto(
    token: string,
    photoId: string,
    file?: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return this.personIntegrationApiClientBuilder(token).updateDistinguishingMarkImage(photoId, file)
  }

  addDistinguishingMarkPhoto(
    token: string,
    prisonerNumber: string,
    sequenceId: string,
    file?: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark> {
    return this.personIntegrationApiClientBuilder(token).addDistinguishingMarkImage(prisonerNumber, sequenceId, file)
  }

  getImage(token: string, imageId: string): Promise<Readable> {
    return this.personIntegrationApiClientBuilder(token).getDistinguishingMarkImage(imageId)
  }
}
