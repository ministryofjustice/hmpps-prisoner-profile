import { RestClientBuilder } from '../data'
import {
  BodyPartId,
  BodyPartSideId,
  MarkTypeId,
  PrisonPersonApiClient,
  PrisonPersonDistinguishingMark,
  PrisonPersonDistinguishingMarkRequest,
} from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import filterEmptyFieldsFromObject from '../utils/filterEmptyFieldsFromObject'
import { BodyPartSelection, MarkTypeSelection } from '../controllers/interfaces/distinguishingMarks/selectionTypes'

const BodyPartSelectionIds: Record<BodyPartSelection, BodyPartId> = {
  back: 'BODY_PART_TORSO',
  face: 'BODY_PART_FACE',
  head: 'BODY_PART_HEAD',
  leftArm: 'BODY_PART_ARM',
  leftFoot: 'BODY_PART_FOOT',
  leftHand: 'BODY_PART_HAND',
  leftLeg: 'BODY_PART_LEG',
  neck: 'BODY_PART_NECK',
  rightArm: 'BODY_PART_ARM',
  rightFoot: 'BODY_PART_FOOT',
  rightHand: 'BODY_PART_HAND',
  rightLeg: 'BODY_PART_LEG',
  torso: 'BODY_PART_TORSO',
}

const BodyPartSideIds: Record<BodyPartSelection, BodyPartSideId> = {
  back: 'SIDE_B',
  face: undefined,
  head: undefined,
  leftArm: 'SIDE_L',
  leftFoot: 'SIDE_L',
  leftHand: 'SIDE_L',
  leftLeg: 'SIDE_L',
  neck: undefined,
  rightArm: 'SIDE_R',
  rightFoot: 'SIDE_R',
  rightHand: 'SIDE_R',
  rightLeg: 'SIDE_R',
  torso: undefined,
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
    bodyPart: BodyPartSelection,
  ): Promise<PrisonPersonDistinguishingMark> {
    const distinguishingMarkRequest: PrisonPersonDistinguishingMarkRequest = {
      prisonerNumber,
      markType: MarkTypeIds[markType],
      bodyPart: BodyPartSelectionIds[bodyPart],
      side: BodyPartSideIds[bodyPart],
    }

    return this.prisonPersonApiClientBuilder(token).postDistinguishingMark(
      filterEmptyFieldsFromObject(distinguishingMarkRequest),
    )
  }
}
