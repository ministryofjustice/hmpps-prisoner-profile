import { PrisonPersonDistinguishingMark } from '../interfaces/prisonPersonApi/prisonPersonApiClient'

export const distinguishingMarkMock: PrisonPersonDistinguishingMark = {
  id: '019205c0-0fd5-7c41-ae24-ede9eae05da5',
  prisonerNumber: 'G4244UD',
  bodyPart: {
    id: 'BODY_PART_ARM',
    description: 'Arm',
    listSequence: 0,
    isActive: true,
  },
  markType: {
    id: 'MARK_TYPE_SCAR',
    description: 'Scar',
    listSequence: 0,
    isActive: true,
  },
  side: null,
  partOrientation: null,
  comment: 'Horrible arm scar',
  photographUuids: ['019205c0-0f5f-7bef-9a24-d64db76ca24a'],
  createdAt: '2024-09-18T16:28:45+0100',
  createdBy: 'hmpps-prisoner-profile-system-1',
}
