import { CommunityManager } from '../../interfaces/prisonerProfileDeliusApi/communityManager'

// eslint-disable-next-line import/prefer-default-export
export const communityManagerMock: CommunityManager = {
  code: 'ABC',
  name: { forename: 'Terry', surname: 'Scott', email: 'terry@email.com' },
  team: { code: 'XYZ', description: 'Probation Team', email: 'team@email.com' },
  unallocated: false,
}
