import { CommunityManager } from '../../interfaces/prisonerProfileDeliusApi/communityManager'

// eslint-disable-next-line import/prefer-default-export
export const communityManagerMock: CommunityManager = {
  code: 'ABC',
  name: { forename: 'Terry', surname: 'Scott' },
  team: { code: 'XYZ', description: 'Probation Team', email: 'team@email.com', telephone: '07711111111' },
  email: 'terry@email.com',
  telephone: '07700000000',
  unallocated: false,
}
