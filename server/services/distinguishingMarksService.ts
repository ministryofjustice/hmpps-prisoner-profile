import { RestClientBuilder } from '../data'
import {
  BodyPartId,
  BodyPartSideId,
  MarkTypeId,
  PartOrientationId,
  PrisonPersonApiClient,
  PrisonPersonDistinguishingMark,
  PrisonPersonDistinguishingMarkRequest,
} from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import filterEmptyFieldsFromObject from '../utils/filterEmptyFieldsFromObject'
import { AllBodyPartSelection, MarkTypeSelection } from '../controllers/interfaces/distinguishingMarks/selectionTypes'
import MulterFile from '../controllers/interfaces/MulterFile'

const bodyPartConfig: Record<
  AllBodyPartSelection,
  { bodyPartId: BodyPartId; side?: BodyPartSideId; orientation?: PartOrientationId }
> = {
  back: { bodyPartId: 'BODY_PART_TORSO', side: 'SIDE_B' },
  face: { bodyPartId: 'BODY_PART_FACE' },
  head: { bodyPartId: 'BODY_PART_HEAD' },
  leftArm: { bodyPartId: 'BODY_PART_ARM', side: 'SIDE_L' },
  leftFoot: { bodyPartId: 'BODY_PART_FOOT', side: 'SIDE_L' },
  leftHand: { bodyPartId: 'BODY_PART_HAND', side: 'SIDE_L' },
  leftLeg: { bodyPartId: 'BODY_PART_LEG', side: 'SIDE_L' },
  neck: { bodyPartId: 'BODY_PART_NECK' },
  rightArm: { bodyPartId: 'BODY_PART_ARM', side: 'SIDE_R' },
  rightFoot: { bodyPartId: 'BODY_PART_FOOT', side: 'SIDE_R' },
  rightHand: { bodyPartId: 'BODY_PART_HAND', side: 'SIDE_R' },
  rightLeg: { bodyPartId: 'BODY_PART_LEG', side: 'SIDE_R' },
  torso: { bodyPartId: 'BODY_PART_TORSO' },
  rightTorso: { bodyPartId: 'BODY_PART_TORSO', side: 'SIDE_R' },
  leftTorso: { bodyPartId: 'BODY_PART_TORSO', side: 'SIDE_L' },
  leftAnkle: { bodyPartId: 'BODY_PART_ANKLE', side: 'SIDE_L' },
  rightAnkle: { bodyPartId: 'BODY_PART_ANKLE', side: 'SIDE_R' },
  ear: { bodyPartId: 'BODY_PART_EAR' },
  leftFinger: { bodyPartId: 'BODY_PART_FINGER', side: 'SIDE_L' },
  rightFinger: { bodyPartId: 'BODY_PART_FINGER', side: 'SIDE_R' },
  leftKnee: { bodyPartId: 'BODY_PART_KNEE', side: 'SIDE_L' },
  rightKnee: { bodyPartId: 'BODY_PART_KNEE', side: 'SIDE_R' },
  lip: { bodyPartId: 'BODY_PART_LIP' },
  nose: { bodyPartId: 'BODY_PART_NOSE' },
  rightShoulder: { bodyPartId: 'BODY_PART_SHOULDER', side: 'SIDE_R' },
  leftShoulder: { bodyPartId: 'BODY_PART_SHOULDER', side: 'SIDE_L' },
  rightThigh: { bodyPartId: 'BODY_PART_THIGH', side: 'SIDE_R' },
  leftThigh: { bodyPartId: 'BODY_PART_THIGH', side: 'SIDE_L' },
  rightToe: { bodyPartId: 'BODY_PART_TOE', side: 'SIDE_R' },
  leftToe: { bodyPartId: 'BODY_PART_TOE', side: 'SIDE_L' },
  upperRightArm: { bodyPartId: 'BODY_PART_ARM', side: 'SIDE_R', orientation: 'PART_ORIENT_UPP' },
  lowerRightArm: { bodyPartId: 'BODY_PART_ARM', side: 'SIDE_R', orientation: 'PART_ORIENT_LOW' },
  upperLeftArm: { bodyPartId: 'BODY_PART_ARM', side: 'SIDE_L', orientation: 'PART_ORIENT_UPP' },
  lowerLeftArm: { bodyPartId: 'BODY_PART_ARM', side: 'SIDE_L', orientation: 'PART_ORIENT_LOW' },
  lowerLeftLeg: { bodyPartId: 'BODY_PART_LEG', side: 'SIDE_L', orientation: 'PART_ORIENT_LOW' },
  lowerRightLeg: { bodyPartId: 'BODY_PART_LEG', side: 'SIDE_R', orientation: 'PART_ORIENT_LOW' },
  upperBack: { bodyPartId: 'BODY_PART_TORSO', side: 'SIDE_B', orientation: 'PART_ORIENT_UPP' },
  lowerBack: { bodyPartId: 'BODY_PART_TORSO', side: 'SIDE_B', orientation: 'PART_ORIENT_LOW' },
  leftElbow: { bodyPartId: 'BODY_PART_ELBOW', side: 'SIDE_L' },
  rightElbow: { bodyPartId: 'BODY_PART_ELBOW', side: 'SIDE_R' },
}

const MarkTypeIds: Record<MarkTypeSelection, MarkTypeId> = {
  mark: 'MARK_TYPE_MARK',
  scar: 'MARK_TYPE_SCAR',
  tattoo: 'MARK_TYPE_TAT',
}

export default class DistinguishingMarksService {
  constructor(private readonly prisonPersonApiClientBuilder: RestClientBuilder<PrisonPersonApiClient>) {}

  postNewDistinguishingMark(
    token: string,
    prisonerNumber: string,
    markType: MarkTypeSelection,
    bodyPart: AllBodyPartSelection,
    description?: string,
    photograph?: MulterFile,
  ): Promise<PrisonPersonDistinguishingMark> {
    const { bodyPartId, side, orientation } = bodyPartConfig[bodyPart]
    const distinguishingMarkRequest: PrisonPersonDistinguishingMarkRequest = {
      prisonerNumber,
      markType: MarkTypeIds[markType],
      bodyPart: bodyPartId,
      side,
      partOrientation: orientation,
      comment: description,
    }

    return this.prisonPersonApiClientBuilder(token).postDistinguishingMark(
      filterEmptyFieldsFromObject(distinguishingMarkRequest),
      photograph,
    )
  }
}
