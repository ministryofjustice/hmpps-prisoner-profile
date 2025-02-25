import groupIdentifyingMarks, {
  getBodyPartDescription,
  getBodyPartToken,
  getMarkLocationDescription,
} from './groupDistinguishingMarksForView'
import { PersonIntegrationDistinguishingMark } from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'

const generateDistinguishingMarks = (
  override: Partial<PersonIntegrationDistinguishingMark>,
): PersonIntegrationDistinguishingMark => ({
  id: 1,
  bookingId: 1,
  offenderNo: 'prisonerNumber',
  bodyPart: {
    id: 'BODY_PART_SHOULDER',
    code: 'SHOULDER',
    description: 'Shoulder',
  },
  markType: {
    id: 'MARK_TYPE_TAT',
    code: 'TAT',
    description: 'tattoo',
  },
  side: {
    id: 'SIDE_L',
    code: 'L',
    description: 'Left',
  },
  partOrientation: {
    id: 'PART_ORIENT_UPP',
    code: 'UPP',
    description: 'upper',
  },
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  ...override,
})

const tattooMark = { id: 'MARK_TYPE_TAT' as const, code: 'TAT' as const, description: 'tattoo' }
const scarMark = { id: 'MARK_TYPE_SCAR' as const, code: 'SCAR' as const, description: 'scar' }
const markMark = { id: 'MARK_TYPE_MARK' as const, code: 'MARK' as const, description: 'mark' }
const otherMark = { id: 'MARK_TYPE_OTH' as const, code: 'OTH' as const, description: 'other mark' }
const sideRight = { id: 'SIDE_R' as const, code: 'R' as const, description: 'Right' }
const sideLeft = { id: 'SIDE_L' as const, code: 'L' as const, description: 'Left' }
const sideFront = { id: 'SIDE_F' as const, code: 'F' as const, description: 'Front' }
const sideBack = { id: 'SIDE_B' as const, code: 'B' as const, description: 'Back' }
const orientationLow = { id: 'PART_ORIENT_LOW' as const, code: 'LOW' as const, description: 'Low' }
const orientationHigh = { id: 'PART_ORIENT_UPP' as const, code: 'UPP' as const, description: 'Upper' }

describe('groupIdentifyingMarks', () => {
  describe('Mark type groups', () => {
    it('should group tattoos, scars and others', () => {
      const markTat = generateDistinguishingMarks({ id: 100, markType: tattooMark })
      const markScar = generateDistinguishingMarks({ id: 101, markType: scarMark })
      const markOth = generateDistinguishingMarks({ id: 102, markType: otherMark })
      const markMark1 = generateDistinguishingMarks({ id: 103, markType: markMark })
      const grouped = groupIdentifyingMarks([markTat, markScar, markOth, markMark1])

      expect(grouped.tattoos['Left arm'][0].id).toEqual(100)
      expect(grouped.scars['Left arm'][0].id).toEqual(101)
      expect(grouped.others['Left arm'][0].id).toEqual(102)
      expect(grouped.others['Left arm'][1].id).toEqual(103)
    })
  })

  describe('Body part groups and locations', () => {
    describe('Left arm', () => {
      test.each`
        bodyPartId    | side         | isLeftArm
        ${'ARM'}      | ${sideLeft}  | ${true}
        ${'SHOULDER'} | ${sideLeft}  | ${true}
        ${'ELBOW'}    | ${sideLeft}  | ${true}
        ${'ELBOW'}    | ${sideRight} | ${false}
      `(
        'returns $expected when body part id is $bodyPartId and side id is $sideId',
        ({ bodyPartId, side, isLeftArm }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Left arm']?.length === 1).toBe(isLeftArm)
        },
      )

      test.each`
        bodyPartId    | orientation        | locationText
        ${'ARM'}      | ${orientationLow}  | ${'Lower arm'}
        ${'SHOULDER'} | ${orientationLow}  | ${'Shoulder'}
        ${'ELBOW'}    | ${orientationLow}  | ${'Elbow'}
        ${'ARM'}      | ${orientationHigh} | ${'Upper arm'}
        ${'ELBOW'}    | ${orientationHigh} | ${'Elbow'}
      `(
        'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
        ({ bodyPartId, orientation, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side: sideLeft,
              partOrientation: orientation,
            }),
          ])

          expect(grouped.tattoos?.['Left arm']?.[0].location).toBe(locationText)
        },
      )

      describe('Right arm', () => {
        test.each`
          bodyPartId    | markType      | side         | isRightArm
          ${'ARM'}      | ${tattooMark} | ${sideRight} | ${true}
          ${'SHOULDER'} | ${tattooMark} | ${sideRight} | ${true}
          ${'ELBOW'}    | ${tattooMark} | ${sideRight} | ${true}
          ${'ELBOW'}    | ${tattooMark} | ${sideLeft}  | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side id is $sideId',
          ({ bodyPartId, markType, side, isRightArm }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                markType,
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Right arm']?.length === 1).toBe(isRightArm)
          },
        )

        test.each`
          bodyPartId    | orientation        | locationText
          ${'ARM'}      | ${orientationLow}  | ${'Lower arm'}
          ${'SHOULDER'} | ${orientationLow}  | ${'Shoulder'}
          ${'ELBOW'}    | ${orientationLow}  | ${'Elbow'}
          ${'ARM'}      | ${orientationHigh} | ${'Upper arm'}
          ${'ELBOW'}    | ${orientationHigh} | ${'Elbow'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
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
          bodyPartId    | markType      | side         | isArm
          ${'ARM'}      | ${tattooMark} | ${null}      | ${true}
          ${'SHOULDER'} | ${tattooMark} | ${null}      | ${true}
          ${'ELBOW'}    | ${tattooMark} | ${null}      | ${true}
          ${'NECK'}     | ${tattooMark} | ${null}      | ${false}
          ${'ELBOW'}    | ${tattooMark} | ${sideRight} | ${false}
          ${'ELBOW'}    | ${tattooMark} | ${sideLeft}  | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $sideId',
          ({ bodyPartId, markType, side, isArm }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                markType,
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Arm']?.length === 1).toBe(isArm)
          },
        )

        test.each`
          bodyPartId    | orientation        | locationText
          ${'ARM'}      | ${orientationLow}  | ${'Lower arm'}
          ${'SHOULDER'} | ${orientationLow}  | ${'Shoulder'}
          ${'ELBOW'}    | ${orientationLow}  | ${'Elbow'}
          ${'ARM'}      | ${orientationHigh} | ${'Upper arm'}
          ${'ELBOW'}    | ${orientationHigh} | ${'Elbow'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
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
              bodyPart: { id: 'BODY_PART_NECK', code: 'NECK', description: 'Neck' },
            }),
          ])

          expect(grouped.tattoos?.['Neck']?.length === 1).toBe(true)
        })
      })

      describe('Face and head', () => {
        test.each`
          bodyPartId | isFaceAndHead
          ${'FACE'}  | ${true}
          ${'HEAD'}  | ${true}
          ${'EAR'}   | ${true}
          ${'NOSE'}  | ${true}
          ${'ELBOW'} | ${false}
        `('returns $expected when body part id is $bodyPartId', ({ bodyPartId, isFaceAndHead }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
            }),
          ])

          expect(grouped.tattoos?.['Face and head']?.length === 1).toBe(isFaceAndHead)
        })

        test.each`
          bodyPartId | locationText
          ${'FACE'}  | ${'Face'}
          ${'EAR'}   | ${'Ear'}
          ${'LIP'}   | ${'Lip'}
          ${'HEAD'}  | ${'Head'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
            }),
          ])

          expect(grouped.tattoos?.['Face and head']?.[0].location).toBe(locationText)
        })
      })

      describe('Right foot', () => {
        test.each`
          bodyPartId | side         | isRightFoot
          ${'FOOT'}  | ${sideRight} | ${true}
          ${'TOE'}   | ${sideRight} | ${true}
          ${'ANKLE'} | ${sideRight} | ${true}
          ${'ANKLE'} | ${null}      | ${false}
          ${'ANKLE'} | ${sideLeft}  | ${false}
          ${'ELBOW'} | ${sideRight} | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isRightFoot }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Right foot']?.length === 1).toBe(isRightFoot)
          },
        )

        test.each`
          bodyPartId | locationText
          ${'FOOT'}  | ${'Right foot'}
          ${'TOE'}   | ${'Toes on right foot'}
          ${'ANKLE'} | ${'Right ankle'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side: sideRight,
            }),
          ])

          expect(grouped.tattoos?.['Right foot']?.[0].location).toBe(locationText)
        })
      })

      describe('Left foot', () => {
        test.each`
          bodyPartId | side         | isLeftFoot
          ${'FOOT'}  | ${sideLeft}  | ${true}
          ${'TOE'}   | ${sideLeft}  | ${true}
          ${'ANKLE'} | ${sideLeft}  | ${true}
          ${'ANKLE'} | ${null}      | ${false}
          ${'ANKLE'} | ${sideRight} | ${false}
          ${'ELBOW'} | ${sideLeft}  | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isLeftFoot }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Left foot']?.length === 1).toBe(isLeftFoot)
          },
        )

        test.each`
          bodyPartId | locationText
          ${'FOOT'}  | ${'Left foot'}
          ${'TOE'}   | ${'Toes on left foot'}
          ${'ANKLE'} | ${'Left ankle'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side: sideLeft,
            }),
          ])

          expect(grouped.tattoos?.['Left foot']?.[0].location).toBe(locationText)
        })
      })

      describe('Foot', () => {
        test.each`
          bodyPartId | side         | isFoot
          ${'FOOT'}  | ${null}      | ${true}
          ${'TOE'}   | ${null}      | ${true}
          ${'ANKLE'} | ${null}      | ${true}
          ${'ANKLE'} | ${sideRight} | ${false}
          ${'ANKLE'} | ${sideLeft}  | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isFoot }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Foot']?.length === 1).toBe(isFoot)
        })

        test.each`
          bodyPartId | locationText
          ${'FOOT'}  | ${'Foot'}
          ${'TOE'}   | ${'Toe'}
          ${'ANKLE'} | ${'Ankle'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side: null,
            }),
          ])

          expect(grouped.tattoos?.['Foot']?.[0].location).toBe(locationText)
        })
      })

      describe('Right hand', () => {
        test.each`
          bodyPartId  | side         | isRightHand
          ${'HAND'}   | ${sideRight} | ${true}
          ${'FINGER'} | ${sideRight} | ${true}
          ${'HAND'}   | ${null}      | ${false}
          ${'HAND'}   | ${sideLeft}  | ${false}
          ${'ELBOW'}  | ${sideRight} | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isRightHand }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Right hand']?.length === 1).toBe(isRightHand)
          },
        )

        test.each`
          bodyPartId  | locationText
          ${'FINGER'} | ${'Fingers on right hand'}
          ${'HAND'}   | ${'Right hand'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side: sideRight,
            }),
          ])

          expect(grouped.tattoos?.['Right hand']?.[0].location).toBe(locationText)
        })
      })

      describe('Left hand', () => {
        test.each`
          bodyPartId  | side         | isLeftHand
          ${'HAND'}   | ${sideLeft}  | ${true}
          ${'FINGER'} | ${sideLeft}  | ${true}
          ${'HAND'}   | ${null}      | ${false}
          ${'HAND'}   | ${sideRight} | ${false}
          ${'ELBOW'}  | ${sideLeft}  | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isLeftHand }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Left hand']?.length === 1).toBe(isLeftHand)
          },
        )

        test.each`
          bodyPartId  | locationText
          ${'FINGER'} | ${'Fingers on left hand'}
          ${'HAND'}   | ${'Left hand'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side: sideLeft,
            }),
          ])

          expect(grouped.tattoos?.['Left hand']?.[0].location).toBe(locationText)
        })
      })

      describe('Hand', () => {
        test.each`
          bodyPartId  | side        | isHand
          ${'HAND'}   | ${sideLeft} | ${false}
          ${'FINGER'} | ${sideLeft} | ${false}
          ${'HAND'}   | ${null}     | ${true}
          ${'FINGER'} | ${null}     | ${true}
          ${'ELBOW'}  | ${null}     | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isHand }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Hand']?.length === 1).toBe(isHand)
        })

        test.each`
          bodyPartId  | locationText
          ${'FINGER'} | ${'Finger'}
          ${'HAND'}   | ${'Hand - no specific location'}
        `('returns $locationText when body part id is $bodyPartId', ({ bodyPartId, locationText }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side: null,
            }),
          ])

          expect(grouped.tattoos?.['Hand']?.[0].location).toBe(locationText)
        })
      })

      describe('Right leg', () => {
        test.each`
          bodyPartId | side         | isRightLeg
          ${'LEG'}   | ${sideRight} | ${true}
          ${'THIGH'} | ${sideRight} | ${true}
          ${'KNEE'}  | ${sideRight} | ${true}
          ${'LEG'}   | ${null}      | ${false}
          ${'LEG'}   | ${sideLeft}  | ${false}
          ${'ELBOW'} | ${sideRight} | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isRightLeg }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Right leg']?.length === 1).toBe(isRightLeg)
          },
        )

        test.each`
          bodyPartId | orientation       | locationText
          ${'LEG'}   | ${orientationLow} | ${'Lower right leg'}
          ${'THIGH'} | ${orientationLow} | ${'Right thigh'}
          ${'KNEE'}  | ${orientationLow} | ${'Right knee'}
          ${'LEG'}   | ${null}           | ${'Leg (general)'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
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
          bodyPartId | side         | isLeftLeg
          ${'LEG'}   | ${sideLeft}  | ${true}
          ${'THIGH'} | ${sideLeft}  | ${true}
          ${'KNEE'}  | ${sideLeft}  | ${true}
          ${'LEG'}   | ${null}      | ${false}
          ${'LEG'}   | ${sideRight} | ${false}
          ${'ELBOW'} | ${sideLeft}  | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isLeftLeg }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Left leg']?.length === 1).toBe(isLeftLeg)
        })

        test.each`
          bodyPartId | orientation       | locationText
          ${'LEG'}   | ${orientationLow} | ${'Lower left leg'}
          ${'THIGH'} | ${orientationLow} | ${'Left thigh'}
          ${'KNEE'}  | ${orientationLow} | ${'Left knee'}
          ${'LEG'}   | ${null}           | ${'Leg (general)'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
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
          bodyPartId | side         | isLeg
          ${'LEG'}   | ${null}      | ${true}
          ${'THIGH'} | ${null}      | ${true}
          ${'KNEE'}  | ${null}      | ${true}
          ${'LEG'}   | ${sideRight} | ${false}
          ${'ELBOW'} | ${sideLeft}  | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isLeg }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Leg']?.length === 1).toBe(isLeg)
        })

        test.each`
          bodyPartId | orientation       | locationText
          ${'LEG'}   | ${orientationLow} | ${'Lower leg'}
          ${'THIGH'} | ${orientationLow} | ${'Thigh'}
          ${'KNEE'}  | ${orientationLow} | ${'Knee'}
          ${'LEG'}   | ${null}           | ${'Leg - no specific location'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
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
          bodyPartId | side         | isFrontAndSides
          ${'TORSO'} | ${sideFront} | ${true}
          ${'TORSO'} | ${sideBack}  | ${false}
          ${'TORSO'} | ${sideRight} | ${true}
          ${'TORSO'} | ${null}      | ${true}
          ${'LEG'}   | ${null}      | ${false}
        `(
          'returns $expected when body part id is $bodyPartId and side is $side',
          ({ bodyPartId, side, isFrontAndSides }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Front and sides']?.length === 1).toBe(isFrontAndSides)
          },
        )

        test.each`
          bodyPartId | side         | locationText
          ${'TORSO'} | ${sideFront} | ${'Front'}
          ${'TORSO'} | ${sideRight} | ${'Right side'}
          ${'TORSO'} | ${sideLeft}  | ${'Left side'}
          ${'TORSO'} | ${null}      | ${'Not entered'}
        `(
          'returns $locationText when body part id is $bodyPartId and side id is $side',
          ({ bodyPartId, side, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
                side,
              }),
            ])

            expect(grouped.tattoos?.['Front and sides']?.[0].location).toBe(locationText)
          },
        )
      })

      describe('Back', () => {
        test.each`
          bodyPartId | side         | isBack
          ${'TORSO'} | ${sideBack}  | ${true}
          ${'LEG'}   | ${sideBack}  | ${false}
          ${'TORSO'} | ${sideFront} | ${false}
          ${'TORSO'} | ${sideRight} | ${false}
          ${'TORSO'} | ${null}      | ${false}
        `('returns $expected when body part id is $bodyPartId and side is $side', ({ bodyPartId, side, isBack }) => {
          const grouped = groupIdentifyingMarks([
            generateDistinguishingMarks({
              bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
              side,
            }),
          ])

          expect(grouped.tattoos?.['Back']?.length === 1).toBe(isBack)
        })

        test.each`
          bodyPartId | orientation        | locationText
          ${'TORSO'} | ${orientationLow}  | ${'Lower back'}
          ${'TORSO'} | ${orientationHigh} | ${'Upper back'}
          ${'TORSO'} | ${null}            | ${'Back'}
        `(
          'returns $locationText when body part id is $bodyPartId and orientation id is $orientation',
          ({ bodyPartId, orientation, locationText }) => {
            const grouped = groupIdentifyingMarks([
              generateDistinguishingMarks({
                bodyPart: { id: `BODY_PART_${bodyPartId}`, code: bodyPartId, description: 'Shoulder' },
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

const leftArmMock: PersonIntegrationDistinguishingMark = {
  id: 1,
  bookingId: 1,
  offenderNo: 'G4244UD',
  bodyPart: {
    id: 'BODY_PART_ARM',
    code: 'ARM',
    description: 'Arm',
  },
  markType: {
    id: 'MARK_TYPE_TAT',
    code: 'TAT',
    description: 'Tattoo',
  },
  side: {
    id: 'SIDE_L',
    code: 'L',
    description: 'Left arm',
  },
  partOrientation: {
    id: 'PART_ORIENT_LOW',
    code: 'LOW',
    description: 'Lower arm',
  },
  comment: 'Comment',
  photographUuids: [{ id: 100, latest: true }],
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
    const result = getMarkLocationDescription(mockInvalidMark as PersonIntegrationDistinguishingMark)
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
    const result = getBodyPartDescription(mockInvalidMark as PersonIntegrationDistinguishingMark)
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
    const result = getBodyPartToken(mockInvalidMark as PersonIntegrationDistinguishingMark)
    expect(result).toBeUndefined()
  })
})
