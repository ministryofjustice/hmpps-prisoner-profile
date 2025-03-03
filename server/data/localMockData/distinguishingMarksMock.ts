import { PersonIntegrationDistinguishingMark } from '../interfaces/personIntegrationApi/personIntegrationApiClient'

export const distinguishingMarkMock: PersonIntegrationDistinguishingMark = {
  id: 1,
  bookingId: 1,
  offenderNo: 'G4244UD',
  bodyPart: {
    id: 'BODY_PART_ARM',
    code: 'ARM',
    description: 'Arm',
  },
  markType: {
    id: 'MARK_TYPE_SCAR',
    code: 'SCAR',
    description: 'Scar',
  },
  side: null,
  partOrientation: null,
  comment: 'Horrible arm scar',
  photographUuids: [{ id: 100, latest: true }],
  createdAt: '2024-09-18T16:28:45+0100',
  createdBy: 'hmpps-prisoner-profile-system-1',
}

export const distinguishingMarkMultiplePhotosMock: PersonIntegrationDistinguishingMark = {
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
    description: 'Left',
  },
  partOrientation: null,
  comment: 'Tribal arm tattoo',
  photographUuids: [
    { id: 100, latest: false },
    { id: 101, latest: false },
    { id: 102, latest: false },
    { id: 103, latest: false },
    { id: 104, latest: false },
    { id: 105, latest: true },
  ],
  createdAt: '2024-09-18T16:28:45+0100',
  createdBy: 'hmpps-prisoner-profile-system-1',
}

export const distinguishingMarkNoPhotosMock: PersonIntegrationDistinguishingMark = {
  id: 2,
  bookingId: 1,
  offenderNo: 'G4244UD',
  bodyPart: {
    id: 'BODY_PART_ARM',
    code: 'ARM',
    description: 'Arm',
  },
  markType: {
    id: 'MARK_TYPE_SCAR',
    code: 'SCAR',
    description: 'Scar',
  },
  side: null,
  partOrientation: null,
  comment: 'Horrible arm scar',
  photographUuids: [],
  createdAt: '2024-09-18T16:28:45+0100',
  createdBy: 'hmpps-prisoner-profile-system-1',
}

export const scarMock: PersonIntegrationDistinguishingMark = {
  id: 3,
  bookingId: 1,
  offenderNo: 'G4244UD',
  bodyPart: {
    id: 'BODY_PART_ARM',
    code: 'ARM',
    description: 'Arm',
  },
  markType: {
    id: 'MARK_TYPE_SCAR',
    code: 'SCAR',
    description: 'Scar',
  },
  side: {
    id: 'SIDE_L',
    code: 'L',
    description: 'Left',
  },
  partOrientation: null,
  comment: 'Horrible arm scar',
  photographUuids: [{ id: 100, latest: true }],
  createdAt: '2024-09-18T16:28:45+0100',
  createdBy: 'hmpps-prisoner-profile-system-1',
}

export const markMock: PersonIntegrationDistinguishingMark = {
  id: 4,
  bookingId: 1,
  offenderNo: 'G4244UD',
  bodyPart: {
    id: 'BODY_PART_LEG',
    code: 'LEG',
    description: 'Leg',
  },
  markType: {
    id: 'MARK_TYPE_MARK',
    code: 'MARK',
    description: 'Mark',
  },
  side: {
    id: 'SIDE_L',
    code: 'L',
    description: 'Left',
  },
  partOrientation: null,
  comment: 'Bump',
  photographUuids: [{ id: 100, latest: true }],
  createdAt: '2024-09-18T16:28:45+0100',
  createdBy: 'hmpps-prisoner-profile-system-1',
}

export const tattooMock: PersonIntegrationDistinguishingMark = {
  id: 5,
  bookingId: 1,
  offenderNo: 'G4244UD',
  bodyPart: {
    id: 'BODY_PART_TORSO',
    code: 'TORSO',
    description: 'Front and sides',
  },
  markType: {
    id: 'MARK_TYPE_TAT',
    code: 'TAT',
    description: 'Tattoo',
  },
  side: null,
  partOrientation: null,
  comment: 'Hand sewn mickey mouse stormtrooper',
  photographUuids: [{ id: 100, latest: true }],
  createdAt: '2024-09-18T16:28:45+0100',
  createdBy: 'hmpps-prisoner-profile-system-1',
}

export const leftLegMarkMock: PersonIntegrationDistinguishingMark = {
  id: 6,
  bookingId: 6,
  offenderNo: 'G4244UD',
  bodyPart: {
    id: 'BODY_PART_LEG',
    code: 'LEG',
    description: 'Leg',
  },
  markType: {
    id: 'MARK_TYPE_TAT',
    code: 'TAT',
    description: 'Tattoo',
  },
  side: {
    id: 'SIDE_L',
    code: 'L',
    description: 'Left',
  },
  partOrientation: null,
  comment: 'Comment',
  photographUuids: [{ id: 100, latest: true }],
  createdAt: '2024-09-18T16:28:45+0100',
  createdBy: 'hmpps-prisoner-profile-system-1',
}
