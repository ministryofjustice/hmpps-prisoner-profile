import { PrisonPersonDistinguishingMark } from '../../data/interfaces/prisonPersonApi/prisonPersonApiClient'
import groupIdentifyingMarks, {
  getBodyPartDescription,
  getBodyPartToken,
  getMarkLocationDescription,
} from './groupDistinguishingMarksForView'

const generateDistinguishingMarks = (
  override: Partial<PrisonPersonDistinguishingMark>,
): PrisonPersonDistinguishingMark => ({
  id: 'id',
  prisonerNumber: 'prisonerNumber',
  bodyPart: {
    id: 'BODY_PART_SHOULDER',
    description: 'Shoulder',
    listSequence: 0,
    isActive: true,
  },
  markType: {
    id: 'MARK_TYPE_TAT',
    description: 'tattoo',
    listSequence: 0,
    isActive: true,
  },
  side: {
    id: 'SIDE_L',
    description: 'Left',
    listSequence: 0,
    isActive: true,
  },
  partOrientation: {
    id: 'PART_ORIENT_UPP',
    description: 'upper',
    listSequence: 0,
    isActive: true,
  },
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  ...override,
})

const tattooMark = { id: 'MARK_TYPE_TAT' as const, description: 'tattoo', listSequence: 0, isActive: true }
const scarMark = { id: 'MARK_TYPE_SCAR' as const, description: 'scar', listSequence: 0, isActive: true }
const markMark = { id: 'MARK_TYPE_MARK' as const, description: 'mark', listSequence: 0, isActive: true }
const otherMark = { id: 'MARK_TYPE_OTH' as const, description: 'other mark', listSequence: 0, isActive: true }
const sideRight = { id: 'SIDE_R' as const, description: 'Right', listSequence: 0, isActive: true }
const sideLeft = { id: 'SIDE_L' as const, description: 'Left', listSequence: 0, isActive: true }
const sideFront = { id: 'SIDE_F' as const, description: 'Front', listSequence: 0, isActive: true }
const sideBack = { id: 'SIDE_B' as const, description: 'Back', listSequence: 0, isActive: true }
const orientationLow = { id: 'PART_ORIENT_LOW' as const, description: 'Low', listSequence: 0, isActive: true }
const orientationHigh = { id: 'PART_ORIENT_UPP' as const, description: 'Upper', listSequence: 0, isActive: true }

describe('groupIdentifyingMarks', () => {
  describe('Mark type groups', () => {
    it('should group tattoos, scars and others', () => {
      const markTat = generateDistinguishingMarks({ id: 'tatid', markType: tattooMark })
      const markScar = generateDistinguishingMarks({ id: 'scarId', markType: scarMark })
      const markOth = generateDistinguishingMarks({ id: 'othId', markType: otherMark })
      const markMark1 = generateDistinguishingMarks({ id: 'markId', markType: markMark })
      const grouped = groupIdentifyingMarks([markTat, markScar, markOth, markMark1])

      expect(grouped.tattoos['Left arm'][0].id).toEqual('tatid')
      expect(grouped.scars['Left arm'][0].id).toEqual('scarId')
      expect(grouped.others['Left arm'][0].id).toEqual('othId')
      expect(grouped.others['Left arm'][1].id).toEqual('markId')
    })
  })

  describe('Body part groups and locations', () => {
    describe('Left arm', () => {
      test.each`
        bodyPartId              | side         | isLeftArm
        ${'BODY_PART_ARM'}      | ${sideLeft}  | ${true}
        ${'BODY_PART_SHOULDER'} | ${sideLeft}  | ${true}
        ${'BODY_PART_ELBOW'}    | ${sideLeft}  | ${true}
        ${'BODY_PART_ELBOW'}    | ${sideRight} | ${false}
      `(
        'returns $expected when body part id is $bodyPartId and side id is $sideId',
        ({ bodyPartId, side, isLeftArm }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Left arm']?.length === 1).toBe(isLeftArm)
        },
      )

      test.each`
        bodyPartId              | orientation        | locationText
        ${'BODY_PART_ARM'}      | ${orientationLow}  | ${'Lower arm'}
        ${'BODY_PART_SHOULDER'} | ${orientationLow}  | ${'Shoulder'}
        ${'BODY_PART_ELBOW'}    | ${orientationLow}  | ${'Elbow'}
        ${'BODY_PART_ARM'}      | ${orientationHigh} | ${'Upper arm'}
        ${'BODY_PART_ELBOW'}    | ${orientationHigh} | ${'Elbow'}
      `(
        'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
        ({ bodyPartId, orientation, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side: sideLeft,
              partOrientation: orientation,
            }),
          ])

          expect(grouped.tattoos?.['Left arm']?.[0].location).toBe(locationText)
        },
      )

      describe('Right arm', () => {
        test.each`
          bodyPartId              | markType      | side         | isRightArm
          ${'BODY_PART_ARM'}      | ${tattooMark} | ${sideRight} | ${true}
          ${'BODY_PART_SHOULDER'} | ${tattooMark} | ${sideRight} | ${true}
          ${'BODY_PART_ELBOW'}    | ${tattooMark} | ${sideRight} | ${true}
          ${'BODY_PART_ELBOW'}    | ${tattooMark} | ${sideLeft}  | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side id is $sideId',
          ({ bodyPartId, markType, side, isRightArm }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                markType,
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Right arm']?.length === 1).toBe(isRightArm)
          },
        )

        test.each`
          bodyPartId              | orientation        | locationText
          ${'BODY_PART_ARM'}      | ${orientationLow}  | ${'Lower arm'}
          ${'BODY_PART_SHOULDER'} | ${orientationLow}  | ${'Shoulder'}
          ${'BODY_PART_ELBOW'}    | ${orientationLow}  | ${'Elbow'}
          ${'BODY_PART_ARM'}      | ${orientationHigh} | ${'Upper arm'}
          ${'BODY_PART_ELBOW'}    | ${orientationHigh} | ${'Elbow'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side: sideRight,
                partOrientation: orientation,
              }),
            ])

            expect(grouped.tattoos?.['Right arm']?.[0].location).toBe(locationText)
          },
        )
      })

      describe('Arm', () => {
        test.each`
          bodyPartId              | markType      | side         | isArm
          ${'BODY_PART_ARM'}      | ${tattooMark} | ${null}      | ${true}
          ${'BODY_PART_SHOULDER'} | ${tattooMark} | ${null}      | ${true}
          ${'BODY_PART_ELBOW'}    | ${tattooMark} | ${null}      | ${true}
          ${'BODY_PART_NECK'}     | ${tattooMark} | ${null}      | ${false}
          ${'BODY_PART_ELBOW'}    | ${tattooMark} | ${sideRight} | ${false}
          ${'BODY_PART_ELBOW'}    | ${tattooMark} | ${sideLeft}  | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $sideId',
          ({ bodyPartId, markType, side, isArm }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                markType,
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Arm']?.length === 1).toBe(isArm)
          },
        )

        test.each`
          bodyPartId              | orientation        | locationText
          ${'BODY_PART_ARM'}      | ${orientationLow}  | ${'Lower arm'}
          ${'BODY_PART_SHOULDER'} | ${orientationLow}  | ${'Shoulder'}
          ${'BODY_PART_ELBOW'}    | ${orientationLow}  | ${'Elbow'}
          ${'BODY_PART_ARM'}      | ${orientationHigh} | ${'Upper arm'}
          ${'BODY_PART_ELBOW'}    | ${orientationHigh} | ${'Elbow'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side: null,
                partOrientation: orientation,
              }),
            ])

            expect(grouped.tattoos?.['Arm']?.[0].location).toBe(locationText)
          },
        )
      })

      describe('Neck', () => {
        it('returns true when body part id is BODY_PART_NECK', () => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: 'BODY_PART_NECK', description: 'xxx', listSequence: 0, isActive: true },
            }),
          ])

          expect(grouped.tattoos?.['Neck']?.length === 1).toBe(true)
        })
      })

      describe('Face and head', () => {
        test.each`
          bodyPartId           | isFaceAndHead
          ${'BODY_PART_FACE'}  | ${true}
          ${'BODY_PART_HEAD'}  | ${true}
          ${'BODY_PART_EAR'}   | ${true}
          ${'BODY_PART_NOSE'}  | ${true}
          ${'BODY_PART_ELBOW'} | ${false}
        `('returns $expected when body part id is $bodyPartId', ({ bodyPartId, isFaceAndHead }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'xxx', listSequence: 0, isActive: true },
            }),
          ])

          expect(grouped.tattoos?.['Face and head']?.length === 1).toBe(isFaceAndHead)
        })

        test.each`
          bodyPartId          | locationText
          ${'BODY_PART_FACE'} | ${'Face'}
          ${'BODY_PART_EAR'}  | ${'Ear'}
          ${'BODY_PART_LIP'}  | ${'Lip'}
          ${'BODY_PART_HEAD'} | ${'Head'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
            }),
          ])

          expect(grouped.tattoos?.['Face and head']?.[0].location).toBe(locationText)
        })
      })

      describe('Right foot', () => {
        test.each`
          bodyPartId           | side         | isRightFoot
          ${'BODY_PART_FOOT'}  | ${sideRight} | ${true}
          ${'BODY_PART_TOE'}   | ${sideRight} | ${true}
          ${'BODY_PART_ANKLE'} | ${sideRight} | ${true}
          ${'BODY_PART_ANKLE'} | ${null}      | ${false}
          ${'BODY_PART_ANKLE'} | ${sideLeft}  | ${false}
          ${'BODY_PART_ELBOW'} | ${sideRight} | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isRightFoot }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Right foot']?.length === 1).toBe(isRightFoot)
          },
        )

        test.each`
          bodyPartId           | locationText
          ${'BODY_PART_FOOT'}  | ${'Right foot'}
          ${'BODY_PART_TOE'}   | ${'Toes on right foot'}
          ${'BODY_PART_ANKLE'} | ${'Right ankle'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side: sideRight,
            }),
          ])

          expect(grouped.tattoos?.['Right foot']?.[0].location).toBe(locationText)
        })
      })

      describe('Left foot', () => {
        test.each`
          bodyPartId           | side         | isLeftFoot
          ${'BODY_PART_FOOT'}  | ${sideLeft}  | ${true}
          ${'BODY_PART_TOE'}   | ${sideLeft}  | ${true}
          ${'BODY_PART_ANKLE'} | ${sideLeft}  | ${true}
          ${'BODY_PART_ANKLE'} | ${null}      | ${false}
          ${'BODY_PART_ANKLE'} | ${sideRight} | ${false}
          ${'BODY_PART_ELBOW'} | ${sideLeft}  | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isLeftFoot }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Left foot']?.length === 1).toBe(isLeftFoot)
          },
        )

        test.each`
          bodyPartId           | locationText
          ${'BODY_PART_FOOT'}  | ${'Left foot'}
          ${'BODY_PART_TOE'}   | ${'Toes on left foot'}
          ${'BODY_PART_ANKLE'} | ${'Left ankle'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side: sideLeft,
            }),
          ])

          expect(grouped.tattoos?.['Left foot']?.[0].location).toBe(locationText)
        })
      })

      describe('Foot', () => {
        test.each`
          bodyPartId           | side         | isFoot
          ${'BODY_PART_FOOT'}  | ${null}      | ${true}
          ${'BODY_PART_TOE'}   | ${null}      | ${true}
          ${'BODY_PART_ANKLE'} | ${null}      | ${true}
          ${'BODY_PART_ANKLE'} | ${sideRight} | ${false}
          ${'BODY_PART_ANKLE'} | ${sideLeft}  | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isFoot }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Foot']?.length === 1).toBe(isFoot)
        })

        test.each`
          bodyPartId           | locationText
          ${'BODY_PART_FOOT'}  | ${'Foot'}
          ${'BODY_PART_TOE'}   | ${'Toe'}
          ${'BODY_PART_ANKLE'} | ${'Ankle'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side: null,
            }),
          ])

          expect(grouped.tattoos?.['Foot']?.[0].location).toBe(locationText)
        })
      })

      describe('Right hand', () => {
        test.each`
          bodyPartId            | side         | isRightHand
          ${'BODY_PART_HAND'}   | ${sideRight} | ${true}
          ${'BODY_PART_FINGER'} | ${sideRight} | ${true}
          ${'BODY_PART_HAND'}   | ${null}      | ${false}
          ${'BODY_PART_HAND'}   | ${sideLeft}  | ${false}
          ${'BODY_PART_ELBOW'}  | ${sideRight} | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isRightHand }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Right hand']?.length === 1).toBe(isRightHand)
          },
        )

        test.each`
          bodyPartId            | locationText
          ${'BODY_PART_FINGER'} | ${'Fingers on right hand'}
          ${'BODY_PART_HAND'}   | ${'Right hand'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side: sideRight,
            }),
          ])

          expect(grouped.tattoos?.['Right hand']?.[0].location).toBe(locationText)
        })
      })

      describe('Left hand', () => {
        test.each`
          bodyPartId            | side         | isLeftHand
          ${'BODY_PART_HAND'}   | ${sideLeft}  | ${true}
          ${'BODY_PART_FINGER'} | ${sideLeft}  | ${true}
          ${'BODY_PART_HAND'}   | ${null}      | ${false}
          ${'BODY_PART_HAND'}   | ${sideRight} | ${false}
          ${'BODY_PART_ELBOW'}  | ${sideLeft}  | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isLeftHand }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Left hand']?.length === 1).toBe(isLeftHand)
          },
        )

        test.each`
          bodyPartId            | locationText
          ${'BODY_PART_FINGER'} | ${'Fingers on left hand'}
          ${'BODY_PART_HAND'}   | ${'Left hand'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side: sideLeft,
            }),
          ])

          expect(grouped.tattoos?.['Left hand']?.[0].location).toBe(locationText)
        })
      })

      describe('Hand', () => {
        test.each`
          bodyPartId            | side        | isHand
          ${'BODY_PART_HAND'}   | ${sideLeft} | ${false}
          ${'BODY_PART_FINGER'} | ${sideLeft} | ${false}
          ${'BODY_PART_HAND'}   | ${null}     | ${true}
          ${'BODY_PART_FINGER'} | ${null}     | ${true}
          ${'BODY_PART_ELBOW'}  | ${null}     | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isHand }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Hand']?.length === 1).toBe(isHand)
        })

        test.each`
          bodyPartId            | locationText
          ${'BODY_PART_FINGER'} | ${'Finger'}
          ${'BODY_PART_HAND'}   | ${'Hand - no specific location'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side: null,
            }),
          ])

          expect(grouped.tattoos?.['Hand']?.[0].location).toBe(locationText)
        })
      })

      describe('Right leg', () => {
        test.each`
          bodyPartId           | side         | isRightLeg
          ${'BODY_PART_LEG'}   | ${sideRight} | ${true}
          ${'BODY_PART_THIGH'} | ${sideRight} | ${true}
          ${'BODY_PART_KNEE'}  | ${sideRight} | ${true}
          ${'BODY_PART_LEG'}   | ${null}      | ${false}
          ${'BODY_PART_LEG'}   | ${sideLeft}  | ${false}
          ${'BODY_PART_ELBOW'} | ${sideRight} | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isRightLeg }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Right leg']?.length === 1).toBe(isRightLeg)
          },
        )

        test.each`
          bodyPartId           | orientation       | locationText
          ${'BODY_PART_LEG'}   | ${orientationLow} | ${'Lower right leg'}
          ${'BODY_PART_THIGH'} | ${orientationLow} | ${'Right thigh'}
          ${'BODY_PART_KNEE'}  | ${orientationLow} | ${'Right knee'}
          ${'BODY_PART_LEG'}   | ${null}           | ${'Leg (general)'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side: sideRight,
                partOrientation: orientation,
              }),
            ])

            expect(grouped.tattoos?.['Right leg']?.[0].location).toBe(locationText)
          },
        )
      })

      describe('Left leg', () => {
        test.each`
          bodyPartId           | side         | isLeftLeg
          ${'BODY_PART_LEG'}   | ${sideLeft}  | ${true}
          ${'BODY_PART_THIGH'} | ${sideLeft}  | ${true}
          ${'BODY_PART_KNEE'}  | ${sideLeft}  | ${true}
          ${'BODY_PART_LEG'}   | ${null}      | ${false}
          ${'BODY_PART_LEG'}   | ${sideRight} | ${false}
          ${'BODY_PART_ELBOW'} | ${sideLeft}  | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isLeftLeg }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Left leg']?.length === 1).toBe(isLeftLeg)
        })

        test.each`
          bodyPartId           | orientation       | locationText
          ${'BODY_PART_LEG'}   | ${orientationLow} | ${'Lower left leg'}
          ${'BODY_PART_THIGH'} | ${orientationLow} | ${'Left thigh'}
          ${'BODY_PART_KNEE'}  | ${orientationLow} | ${'Left knee'}
          ${'BODY_PART_LEG'}   | ${null}           | ${'Leg (general)'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side: sideLeft,
                partOrientation: orientation,
              }),
            ])

            expect(grouped.tattoos?.['Left leg']?.[0].location).toBe(locationText)
          },
        )
      })

      describe('Leg', () => {
        test.each`
          bodyPartId           | side         | isLeg
          ${'BODY_PART_LEG'}   | ${null}      | ${true}
          ${'BODY_PART_THIGH'} | ${null}      | ${true}
          ${'BODY_PART_KNEE'}  | ${null}      | ${true}
          ${'BODY_PART_LEG'}   | ${sideRight} | ${false}
          ${'BODY_PART_ELBOW'} | ${sideLeft}  | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isLeg }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Leg']?.length === 1).toBe(isLeg)
        })

        test.each`
          bodyPartId           | orientation       | locationText
          ${'BODY_PART_LEG'}   | ${orientationLow} | ${'Lower leg'}
          ${'BODY_PART_THIGH'} | ${orientationLow} | ${'Thigh'}
          ${'BODY_PART_KNEE'}  | ${orientationLow} | ${'Knee'}
          ${'BODY_PART_LEG'}   | ${null}           | ${'Leg - no specific location'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side: null,
                partOrientation: orientation,
              }),
            ])

            expect(grouped.tattoos?.['Leg']?.[0].location).toBe(locationText)
          },
        )
      })

      describe('Front and sides', () => {
        test.each`
          bodyPartId           | side         | isFrontAndSides
          ${'BODY_PART_TORSO'} | ${sideFront} | ${true}
          ${'BODY_PART_TORSO'} | ${sideBack}  | ${false}
          ${'BODY_PART_TORSO'} | ${sideRight} | ${true}
          ${'BODY_PART_TORSO'} | ${null}      | ${true}
          ${'BODY_PART_LEG'}   | ${null}      | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isFrontAndSides }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Front and sides']?.length === 1).toBe(isFrontAndSides)
          },
        )

        test.each`
          bodyPartId           | side         | locationText
          ${'BODY_PART_TORSO'} | ${sideFront} | ${'Front'}
          ${'BODY_PART_TORSO'} | ${sideRight} | ${'Right side'}
          ${'BODY_PART_TORSO'} | ${sideLeft}  | ${'Left side'}
          ${'BODY_PART_TORSO'} | ${null}      | ${'Not entered'}
        `(
          'returns $locationText when body part id is $bodyPartId and side id is $side',
          ({ bodyPartId, side, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Front and sides']?.[0].location).toBe(locationText)
          },
        )
      })

      describe('Back', () => {
        test.each`
          bodyPartId           | side         | isBack
          ${'BODY_PART_TORSO'} | ${sideBack}  | ${true}
          ${'BODY_PART_LEG'}   | ${sideBack}  | ${false}
          ${'BODY_PART_TORSO'} | ${sideFront} | ${false}
          ${'BODY_PART_TORSO'} | ${sideRight} | ${false}
          ${'BODY_PART_TORSO'} | ${null}      | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isBack }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Back']?.length === 1).toBe(isBack)
        })

        test.each`
          bodyPartId           | orientation        | locationText
          ${'BODY_PART_TORSO'} | ${orientationLow}  | ${'Lower back'}
          ${'BODY_PART_TORSO'} | ${orientationHigh} | ${'Upper back'}
          ${'BODY_PART_TORSO'} | ${null}            | ${'Back'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: bodyPartId, description: 'Shoulder', listSequence: 0, isActive: true },
                side: sideBack,
                partOrientation: orientation,
              }),
            ])

            expect(grouped.tattoos?.['Back']?.[0].location).toBe(locationText)
          },
        )
      })
    })
  })
})

const leftArmMock: PrisonPersonDistinguishingMark = {
  id: '019205c0-0fd5-7c41-ae24-ede9eae05da5',
  prisonerNumber: 'G4244UD',
  bodyPart: {
    id: 'BODY_PART_ARM',
    description: 'Arm',
    listSequence: 0,
    isActive: true,
  },
  markType: {
    id: 'MARK_TYPE_TAT',
    description: 'Tattoo',
    listSequence: 0,
    isActive: true,
  },
  side: {
    id: 'SIDE_L',
    description: 'Left arm',
    listSequence: 0,
    isActive: true,
  },
  partOrientation: {
    id: 'PART_ORIENT_LOW',
    description: 'Lower arm',
    listSequence: 0,
    isActive: true,
  },
  comment: 'Comment',
  photographUuids: [{ id: '019205c0-0f5f-7bef-9a24-d64db76ca24a', latest: true }],
  createdAt: '2024-09-18T16:28:45+0100',
  createdBy: 'test-user',
}

describe('getMarkLocationDescription', () => {
  it('should return the location description for a valid body part', () => {
    const result = getMarkLocationDescription(leftArmMock)
    expect(result).toBe('Lower arm')
  })

  it('should return "No specific location" if no body part matches', () => {
    const mockInvalidMark = { bodyPart: { id: 'INVALID_PART' } }
    const result = getMarkLocationDescription(mockInvalidMark as PrisonPersonDistinguishingMark)
    expect(result).toBe('No specific location')
  })
})

describe('getBodyPartDescription', () => {
  it('should return the body part name for a valid body part', () => {
    const result = getBodyPartDescription(leftArmMock)
    expect(result).toBe('Left arm')
  })

  it('should return "Uncategorised" if no body part matches', () => {
    const mockInvalidMark = { bodyPart: { id: 'INVALID_PART' } }
    const result = getBodyPartDescription(mockInvalidMark as PrisonPersonDistinguishingMark)
    expect(result).toBe('Uncategorised')
  })
})

describe('getBodyPartToken', () => {
  it('should return the correct token for a matching body part', () => {
    const result = getBodyPartToken(leftArmMock)
    expect(result).toBe('left-arm')
  })

  it('should return undefined if no token matches the body part', () => {
    const mockInvalidMark = { bodyPart: { id: 'INVALID_PART' } }
    const result = getBodyPartToken(mockInvalidMark as PrisonPersonDistinguishingMark)
    expect(result).toBeUndefined()
  })
})
